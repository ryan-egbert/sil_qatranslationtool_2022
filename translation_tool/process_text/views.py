### Imports
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader
from colour import Color
from random import choice, shuffle
import warnings
# from .models import TextPair, User
from .classes import TextPair, User
import csv
import io
import os
import random
import hashlib
import pymongo
import json
client = pymongo.MongoClient("mongodb+srv://admin1:admin@cluster0.84e6s.mongodb.net/translation_tool?retryWrites=true&w=majority")
DB = client.translation_tool
CUR_USER = None
from torch import no_grad, matmul
import torch.nn.functional as F
# import pickle as pck
from transformers import BertModel, BertTokenizerFast
# with open('model.pck', 'rb') as f:
#     model = pck.load(f)
# with open('tokenizer.pck', 'rb') as f:
#     tokenizer = pck.load(f)

### Load similarity model (LaBSE)
tokenizer = BertTokenizerFast.from_pretrained("setu4993/LaBSE")
model = BertModel.from_pretrained("setu4993/LaBSE")
model = model.eval()

### Read in dummy csv
# reader = csv.reader(open('/Users/ryanegbert/Desktop/spring22/ip/app/covid_files/csv/test_file.csv', 'r'))
# first_row = True
# langs = []
# source_text = []
# translated_text = []
# for row in reader:
#     if first_row:
#         langs = row
#         first_row = False
#         continue
#     source_text.append(row[0])
#     translated_text.append(row[1])
ID = random.randint(10000,99999)
# TP = TextPairClass(source_text, translated_text, _id=-1)


# Index page (this is not used, can be deleted)
def index(request):
    context = {
        'cur_user': CUR_USER,
        'source_txt': 'This is source text',
        'trans_txt': 'This is translated text'
    }
    return render(request, 'process_text/index.html', context)

# Login page
def login(request):
    context = {}
    return render(request, 'process_text/login.html', context)

# Hash passwords during registration
# Returns list of integers
# def hash_pass(password, salt):
#     key = hashlib.pbkdf2_hmac(
#         'sha256', 
#         password.encode('utf-8'), 
#         salt, 100000)

#     return list(key)

def verify_pass(user, password):
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        user['salt'], 100000
    )

    return user['salt'] + key == user['password']

# Process login request
# TODO: Redirects to upload page if authentication succeeds
def process_login(request):
    global CUR_USER
    username = request.GET['username']
    password = request.GET['password']
    col = DB.user
    user = col.find_one({'username':username})
    if user != None:
        CUR_USER = user
        # user_pass = user.password.split(' ')
        # user_pass_int = [int(i) for i in user_pass]
        # user_salt = user.salt.split(' ')
        # user_salt_bytes = bytes([int(i) for i in user_salt])

        # key = hash_pass(password, user_salt_bytes)
    
        if verify_pass(user, password):
            return redirect('upload')
        else:
            return redirect('loginuser')

# Register page
def register(request):
    context = {}
    return render(request, 'process_text/register.html', context)

# Process registration requests
# TODO: Redirect to home page
def process_registration(request):
    if request.method == 'POST':
        col = DB.user
        username = request.POST['username']
        full_name = request.POST['fullname']
        password = request.POST['password']
        user = col.find_one({'username':username})
        if user == None:
            user = User(username, password)
            col.insert_one(user.dict)
        else:
            warnings.warn("User " + username + " already exists. Please choose a different username.")
            context = {
                'warn': 'User \'' + username + '\' already exists. Please choose a different username.'
            }
            return render(request, 'process_text/register.html', context)

        # salt = os.urandom(32)
        # key = hash_pass(password, salt)
        # salt_list = list(salt)

        # user = User()
        # user.username = username
        # salt_list_str = [str(i) for i in salt_list]
        # key_str = [str(i) for i in key]
        # user.password = ' '.join(salt_list_str + key_str)
        # user.salt = ' '.join(salt_list_str)
        # user.save()

    return redirect('upload')

# Upload page
def upload(request):
    context = {'cur_user': CUR_USER,}
    return render(request, 'process_text/upload.html', context)

# Compute similarity score between two embedded outputs
def similarity_score(source, translated):
    global model, tokenizer
    ID = random.randint(10000,99999)
    while DB.textpair.find_one({'id':ID}) != None:
        ID = random.randint(10000,99999)
    # Tokenize inputs
    source_inputs = tokenizer(source, return_tensors="pt", padding=True)
    translated_inputs = tokenizer(translated, return_tensors="pt", padding=True)
    # Convert inputs with LaBSE model
    with no_grad():
        source_outputs = model(**source_inputs)
    with no_grad():
        translated_outputs = model(**translated_inputs)
    # Embed outputs
    source_emb = source_outputs.pooler_output
    translated_emb = translated_outputs.pooler_output
    # Cosine similarity between embedded outputs
    # mat = similarity_score(source_emb, translated_emb)
    normalized_embeddings_s = F.normalize(source_emb, p=2)
    normalized_embeddings_t = F.normalize(translated_emb, p=2)
    mat = matmul(normalized_embeddings_s, normalized_embeddings_t.transpose(0, 1))
    return (5 * mat.diagonal()).tolist()

# Using Flesch–Kincaid readability tests
def readability_score(text):
    scores = []
    for sent in text:
        if len(sent) == 0:
            score = 0
        else:
            score = len(sent.split()) - (len([char for word in sent.split() for char in word])/len(sent.split()))
        scores.append(score)
    # num_sent = len(text)
    # num_words = len([word for sent in text for word in sent.split()])
    # num_char = len([char for sent in text for word in sent.split() for char in word])
    # # print(num_sent, num_words, num_char)
    # return (num_words/num_sent) - (num_char/num_words)
    return scores

# Process file upload
# TODO: Add similarity score implementation
def processFile(request):
    # global TP
    global ID
    # global model
    global DB
    if request.method == 'POST':
        reader = csv.reader(io.StringIO(request.FILES['uploadFile'].read().decode()))
        first_row = True
        langs = []
        source_text = []
        translated_text = []
        for row in reader:
            if first_row:
                langs = row
                first_row = False
                continue
            source_text.append(row[0])
            translated_text.append(row[1])
        sim_scores = similarity_score(source_text, translated_text)
        read_scores = readability_score(translated_text)
        text_pair = TextPair(source_text, translated_text, sim_scores=sim_scores, _id=ID)
        col = DB.textpair

        # col.insert_one(text_pair.dict)
        with open("./json/" + str(ID) + ".json", 'w') as f:
            json.dump(text_pair.dict, f)
    # text_pair = TP

    return processing(request, text_pair, None)

# Process manual text input
def processText(request):
    global ID, model, DB
    if request.method == "POST":
        # print(request.user)
        # Get source text and translated text
        source_text = request.POST['source'].split('\n')
        translated_text = request.POST['translated'].split('\n')
        # print(request.POST)
        sim_check = comp_check = read_check = semdom_check = None
        if 'sim-check' in request.POST:
            sim_check = 's'
        if 'comp-check' in request.POST:
            comp_check = 'c'
        if 'read-check' in request.POST:
            read_check = 'r'
        if 'semdom-check' in request.POST:
            semdom_check = 'd'

        options_ = [op for op in [sim_check, comp_check, read_check, semdom_check] if op != None]
        # print(sim_check, comp_check, read_check, semdom_check)
        # TODO: Get id of translation
        sim_scores = similarity_score(source_text, translated_text)
        read_scores = readability_score(translated_text)
        # scores = [0.1] * len(source_text)

        text_pair = TextPair(source_text, translated_text, sim_scores=sim_scores, read_scores=read_scores, options=options_, _id=ID)
        col = DB.textpair
        # col.insert_one(text_pair.dict)
        with open("./json/" + str(ID) + ".json", 'w') as f:
            json.dump(text_pair.dict, f)

    return processing(request, text_pair, None)

# Processing page
# TODO: Add progress bars to this page (use AJAX?)
def processing(request, text_pair, options):
    context = {}
    return render(request, 'process_text/processing.html', context)

# Main grid results page
# TODO: Add d3 visualizations to each section that was selected
def results(request):
    context = {
        'cur_user': CUR_USER,
        'sidebar': True
    }
    return render(request, 'process_text/results.html', context)

# Metrics view
# Displays info from each selected metric
def metric_view(request):
    # Get (or create) text pair
    col = DB.textpair
    # tp = col.find_one({'id':ID})
    with open("./json/" + str(ID) + ".json", 'r') as f:
        tp = json.load(f)
    # print(tp['options'])
    
    # Determine sentence groups and scores
    all_sentences = tp['matches']

    # # Get actual text
    # sentences_s = []
    # sentences_t = []
    # scores = []
    # for text in t1_sent:
    #     sentences_s.append(text['text'])
    # for text in t2_sent:
    #     sentences_t.append(text['text'])
    # for score in scores_tp:
    #     scores.append(score)

    # Add data to all_sentences list
    # all_sentences = []
    # # Determine score for each sentence pair
    # for i in range(len(sentences_s)):
    #     if scores[i]['score'] < 75:
    #         color = '#f00'
    #     elif scores[i]['score'] < 85:
    #         color = '#ffe587'
    #     else:
    #         color = '#fff'
    #     # Add info
    #     all_sentences.append({
    #         's' : (sentences_s[i],sentences_t[i]),
    #         'color' : color,
    #         'idx': i,
    #         'score': scores[i]['score'],
    #     })

    context = {
        'cur_user': CUR_USER,
        'sentences': all_sentences,
        'options': tp['options'],
        'sidebar': True,
    }

    return render(request, 'process_text/metric_view.html', context)



###########################################################
### These four views are not being used and can be deleted
# def comprehensibility(request):
#     red = Color("#ff8585")
#     white = Color("white")
#     colors = list(red.range_to(white, 3))
#     random_questions = [
#         'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?',
#         'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat?',
#         'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur?',
#         'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum?'
#     ]
#     random_answers = [
#         'consectetur',
#         'enim',
#         'reprehenderit',
#         'proident'
#     ]
#     tp = TextPair.objects.get(pair_id=ID)
#     t1_sent = tp.text1['sentences']
#     t2_sent = tp.text2['sentences']
#     sentences_s = []
#     sentences_t = []
#     for text in t1_sent:
#         sentences_s.append(text['text'])
#     for text in t2_sent:
#         sentences_t.append(text['text'])
#     all_sentences = []
#     for i in range(len(sentences_s)):
#         all_sentences.append({
#             's': sentences_s[i],
#             't': sentences_t[i],
#             'color': choice(colors).hex,
#             'idx': i,
#         })

#     all_questions = []
#     for i in range(len(sentences_s)):
#         questions = []
#         questions.append({
#             'question': choice(random_questions),
#             'answer': choice(random_answers),
#             'color': choice(colors)
#         })
#         all_questions.append(questions)
#     context = {
#         'sentences': all_sentences,
#         'questions': all_questions,
#         'sidebar': True,
#     }

#     return render(request, 'process_text/comprehensibility.html', context)

# def readability(request):
#     red = Color("#ff8585")
#     green = Color("#87c985")
#     colors = list(red.range_to(green, 10))
#     tp = TextPair.objects.get(pair_id=ID)
#     t1_sent = tp.text1['sentences']
#     t2_sent = tp.text2['sentences']
#     sentences_s = []
#     sentences_t = []
#     for text in t1_sent:
#         sentences_s.append(text['text'])
#     for text in t2_sent:
#         sentences_t.append(text['text'])
#     all_sentences = []
#     for i in range(len(sentences_t)):
#         all_sentences.append({
#             's': sentences_t[i],
#             'color': choice(colors).hex,
#             'idx': i,
#         })
#     context = {
#         'sentences': all_sentences,
#         'sidebar': True,
#     }
#     return render(request, 'process_text/readability.html', context)

# def semanticdomain(request):
#     red = Color("#ff8585")
#     green = Color("#87c985")
#     colors = list(red.range_to(green, 10))
#     tp = TextPair.objects.get(pair_id=ID)
#     t1_sent = tp.text1['sentences']
#     t2_sent = tp.text2['sentences']
#     sentences_s = []
#     sentences_t = []
#     for text in t1_sent:
#         sentences_s.append(text['text'])
#     for text in t2_sent:
#         sentences_t.append(text['text'])
#     all_sentences = []
#     for i in range(len(sentences_t)):
#         all_sentences.append({
#             's': sentences_t[i],
#             'color': choice(colors).hex,
#             'idx': i,
#         })
#     context = {
#         'sentences': all_sentences,
#         'sidebar': True,
#     }
#     return render(request, 'process_text/semanticdomain.html', context)

# def similarity(request):
#     red = Color("#ff8585")
#     green = Color("#87c985")
#     colors = list(red.range_to(green,10))
#     tp = TextPair.objects.get(pair_id=ID)
#     t1_sent = tp.text1['sentences']
#     t2_sent = tp.text2['sentences']
#     sentences_s = []
#     sentences_t = []
#     for text in t1_sent:
#         sentences_s.append(text['text'])
#     for text in t2_sent:
#         sentences_t.append(text['text'])
#     all_sentences = []
#     for i in range(len(sentences_s)):
#         all_sentences.append({
#             's' : sentences_s[i],
#             't' : sentences_t[i],
#             'color' : choice(colors).hex,
#             'idx': i,
#         })
#     context = {
#         'sentences': all_sentences,
#         'sidebar': True,
#     }
#     return render(request, 'process_text/similarity.html', context)

###########################################################