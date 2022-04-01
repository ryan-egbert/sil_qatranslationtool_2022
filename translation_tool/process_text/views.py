### Imports
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout 
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.template import loader
from random import choice, shuffle
import warnings
from .classes import TextPair, UserMongo
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
from transformers import BertModel, BertTokenizerFast
from transformers.pipelines import pipeline
from io import StringIO

### Load models
tokenizer = BertTokenizerFast.from_pretrained("setu4993/LaBSE")
model = BertModel.from_pretrained("setu4993/LaBSE")
model = model.eval()

req_model = "mrm8488/bert-multi-cased-finetuned-xquadv1"
req_tokenizer = "mrm8488/bert-multi-cased-finetuned-xquadv1"
hg_comp = pipeline('question-answering', model=req_model, tokenizer=req_tokenizer)

# Home page
def home(request):
    global DB
    context = {}
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        context['cur_user'] = user
    
    return render(request, 'process_text/home.html', context)

# Login page
def login_view(request):
    context = {}
    return render(request, 'process_text/login.html', context)

# Process login request
def process_login(request):
    username = request.GET['username']
    password = request.GET['password']
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return redirect('home')
    else:
        return redirect('loginuser')

# Process logout request
def process_logout(request):
    if request.user.is_authenticated:
        logout(request)
    return redirect('home')

# Register page
def register(request):
    context = {}
    return render(request, 'process_text/register.html', context)

# Process registration requests
def process_registration(request):
    if request.method == 'POST':
        # Get user information
        col = DB.user
        username = request.POST['username']
        email = request.POST['email']
        first_name = request.POST['firstname']
        last_name = request.POST['lastname']
        password = request.POST['password']
        user = col.find_one({'username':username})
        # Save user to database, login user
        if user == None:
            user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)
            user.save()
            userMongo = UserMongo(username, password, email, first_name, last_name)
            col.insert_one(userMongo.dict)
            login(request, user)
        # If username exists, prompt user to enter a new one
        else:
            warnings.warn("User " + username + " already exists. Please choose a different username.")
            context = {
                'warn': 'User \'' + username + '\' already exists. Please choose a different username.'
            }
            return render(request, 'process_text/register.html', context)

    return redirect('home')

# Load account settings page
def account_settings(request):
    context = {}
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        context['cur_user'] = user
    return render(request, 'process_text/account_settings.html', context)

# Preview of translations
def preview_translation(matches):
    if len(matches) < 1:
        return 'No text available'
    else:
        return matches[0]['source'][:25] + '...'

# Get average of similarity scores
def avg_sim(matches):
    score = 0
    num_scores = len(matches)
    for m in matches:
        score += float(m['sim_score'])

    if num_scores == 0:
        return 0
    return round(score / num_scores, 2)

# Get average of readability scores
def avg_read(matches):
    score = 0
    num_scores = len(matches)
    for m in matches:
        score += float(m['read_score'])

    if num_scores == 0:
        return 0
    return round(score / num_scores, 2)

# Get number of correct questions
def num_comp(matches):
    num_correct = 0
    num_questions = 0
    for m in matches:
        if m['comp_score'] is not None and type(m['comp_score']) is not int and len(m['comp_score']) > 0:
            for question in m['comp_score']:
                try:
                    num_questions += 1
                    if question['correct']:
                        num_correct += 1
                except:
                    pass
    
    return f'{num_correct} / {num_questions}'

# User translations page
def user_translations(request):
    global DB
    context = {}
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        context['cur_user'] = user

        # Get user's translations
        translations = DB.textpair.find({'user': user['username']}).sort('datetime', -1)

        # Construct rows/cols for translations page
        translation_cols = []
        translation_row = []
        for t in translations:
            translation_row.append({
                'id': t['id'],
                'preview': preview_translation(t['matches']),
                'avg_sim': avg_sim(t['matches']),
                'avg_read': avg_read(t['matches']),
                'num_comp': num_comp(t['matches']),
            })
            if len(translation_row) == 3:
                translation_cols.append(translation_row)
                translation_row = []
        translation_cols.append(translation_row)

        context['translations'] = translation_cols

    return render(request, 'process_text/all_translations.html', context)

# Translation results page
# Similar to results page
def translation_results(request, t_id):
    global DB
    context = {}
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        context['cur_user'] = user
        tp = DB.textpair.find_one({'id': int(t_id)})

        if tp is not None:
            context['sentences'] = tp['matches']
            context['options'] = tp['options']
            context['id'] = tp['id']

    return render(request, 'process_text/results.html', context)

# Upload page
def upload(request, warnings=None):
    global DB
    context = {}
    if warnings is not None:
        context['warnings'] = warnings
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        context['cur_user'] = user
    return render(request, 'process_text/upload.html', context)

# Compute similarity score between two embedded outputs
def similarity_score(source, translated):
    global tokenizer, model
    # Tokenize inputs
    if len(source) == 0:
        source = ['']
    if len(translated) == 0:
        translated = ['']
    source_inputs = tokenizer(source, return_tensors="pt", padding=True, max_length=512, add_special_tokens=False)
    translated_inputs = tokenizer(translated, return_tensors="pt", padding=True, max_length=512, add_special_tokens=False)
    # Convert inputs with LaBSE model
    with no_grad():
        source_outputs = model(**source_inputs)
    with no_grad():
        translated_outputs = model(**translated_inputs)
    # Embed outputs
    source_emb = source_outputs.pooler_output
    translated_emb = translated_outputs.pooler_output
    # Cosine similarity between embedded outputs
    normalized_embeddings_s = F.normalize(source_emb, p=2)
    normalized_embeddings_t = F.normalize(translated_emb, p=2)
    mat = matmul(normalized_embeddings_s, normalized_embeddings_t.transpose(0, 1))
    return (5 * mat.diagonal()).tolist()

def comprehensibility_score(questions):
    global hg_comp
    result = []
    for question in questions:
        if question[0]['question'] == None:
            result.append(None)
        else:
            # Ask question and determine similarity between answer and user provided answer
            answer = hg_comp(question[0])
            sim = similarity_score(question[1], answer['answer'])
            correct = True if sim[0] >= 3 else False
            result.append({'question': question[0]['question'], 'answer': answer, 'expected': question[1], 'correct': correct, 'result_sim': sim})

    return result


# Using basic readability score (characters per word)
def readability_score(text):
    scores = []
    for sent in text:
        if len(sent.split()) == 0:
            score = 0
        else:
            char_per_word = len([char for word in sent.split() for char in word]) / len(sent.split())
            words_in_sent = len(sent.split())
            # score = char_per_word / words_in_sent
            score = char_per_word
        scores.append(score)

    return scores

# Process file upload
def processFile(request):
    global DB
    if request.method == 'POST':
        if request.user.is_authenticated:
            user = DB.user.find_one({'username': str(request.user)})
            # TODO: Handle large files
            # if request.FILES['uploadFile'].multiple_chunks():
            #     pass
            # else:
            # Read in file
            file_read = request.FILES['uploadFile'].read()
            # Decode file
            try:
                file_str = file_read.decode('utf-8')
            except UnicodeDecodeError:
                file_str = file_read.decode('utf-16')
            except UnicodeDecodeError:
                warnings = [
                    'The file cannot be decoded. Please use a different file encoding.'
                ]
                return upload(request, warnings)
            # Organize text
            file_strio = StringIO(file_str)
            reader = csv.DictReader(file_strio)
            langs = []
            source_text = []
            translated_text = []
            questions = []
            for row in reader:
                source_text.append(row['source'])
                translated_text.append(row['translated'])
                questions.append(({
                    'context': row['translated'],
                    'question': row['question'] if row['question'] != '' else None
                }, row['answer'] if row['answer'] != '' else None))
            # Score text
            try:
                sim_scores = similarity_score(source_text, translated_text)
                read_scores = readability_score(translated_text)
                comp_scores = comprehensibility_score(questions)
                col = DB.textpair
                ID = random.randint(10000,99999)
                while col.find_one({'id': ID}) is not None:
                    ID = random.randint(10000,99999)

                text_pair = TextPair(source_text, translated_text, sim_scores=sim_scores, read_scores=read_scores, comp_scores=comp_scores, user=user, _id=ID)
                # Push translation to db
                result = col.insert_one(text_pair.dict)
                DB.user.update_one(
                    {'username': str(request.user)},
                    {'$push': { 
                        'translations' : result.inserted_id
                    }})
            except RuntimeError or KeyError as e:
                warnings = [
                    'The file may not be formatted correctly. Try to remove large bits of text from the file.'
                ]
                return upload(request, warnings)

    return redirect('results')

# Process manual text input
def processText(request):
    global DB
    if request.method == "POST":
        if request.user.is_authenticated:
            user = DB.user.find_one({'username': str(request.user)})
            # Get source text and translated text
            source_text = request.POST['source'].split('\n')
            translated_text = request.POST['translated'].split('\n')
            sim_check = comp_check = read_check = None
            sim_scores = comp_scores = read_scores = []
            # Score text
            try:
                if len(source_text) != len(translated_text):
                    raise RuntimeError
                if 'sim-check' in request.POST:
                    sim_check = 's'
                    sim_scores = similarity_score(source_text, translated_text)
                if 'comp-check' in request.POST:
                    comp_check = 'c'
                if 'read-check' in request.POST:
                    read_check = 'r'
                    read_scores = readability_score(translated_text)

                options_ = [op for op in [sim_check, comp_check, read_check] if op != None]
                col = DB.textpair
                ID = random.randint(10000,99999)
                while col.find_one({'id': ID}) is not None:
                    ID = random.randint(10000,99999)
                # Push translation to db
                text_pair = TextPair(source_text, translated_text, sim_scores=sim_scores, read_scores=read_scores, comp_scores=[None]*len(source_text), options=options_, user=user, _id=ID)
                col = DB.textpair
                result = col.insert_one(text_pair.dict)
                DB.user.update_one(
                    {'username': str(request.user)},
                    {'$push': { 
                        'translations' : result.inserted_id
                    }})
            except RuntimeError or IndexError:
                warnings = [
                    'Source text and translated text have different lengths. Ensure the source text and translated text have the same number of lines.'
                ]
                return upload(request, warnings)

    return redirect('results')

# Main grid results page
def results(request):
    context = {}
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        context['cur_user'] = user

        # Get (or create) text pair
        col = DB.textpair
        tpId = user['translations'][-1]
        tp = col.find_one({'_id': tpId})
        
        # Determine sentence groups and scores
        if tp is not None:
            context['sentences'] = tp['matches']
            context['options'] = tp['options']
            context['id'] = tp['id']
    return render(request, 'process_text/results.html', context)

### About pages
def aboutcomprehensibility(request):
    context = {
        'sidebar': True
    }
    return render(request, 'process_text/AboutComprehensibility.html', context)

def aboutreadability(request):
    context = {
        'sidebar': True
    }
    return render(request, 'process_text/AboutReadability.html', context)

def aboutsemanticdomain(request):
    context = {
        'sidebar': True
    }
    return render(request, 'process_text/AboutSemanticDomain.html', context)

def aboutsemanticsimilarity(request):
    context = {
        'sidebar': True
    }
    return render(request, 'process_text/AboutSemanticSimilarity.html', context)   

### API FUNCTIONS
# Get similarity data
def get_sim_data(request, id_):
    global DB
    col = DB.textpair
    sim_data = []
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        data = col.find_one({'id':int(id_)})

        for pair in data['matches']:
            sim_data.append(float(pair['sim_score']))
    return JsonResponse({'data': sim_data})

# Get comprehensibility data
def get_comp_data(request, id_, idx):
    global DB
    col = DB.textpair
    comp_data = []
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        data = col.find_one({'id':int(id_)})
        for pair in data['matches']:
            comp_data.append(pair['comp_score'])
        if idx == 'all':
            correct = 0
            incorrect = 0
            idxs = []
            for i in range(len(comp_data)):
                data = comp_data[i]
                if data is not None:
                    for d in data:
                        if d['correct']:
                            correct += 1
                            idxs.append({'idx': i, 'res': 'c'})
                        else:
                            incorrect += 1
                            idxs.append({'idx': i, 'res': 'i'})
            return JsonResponse({'data': {'Correct': correct, 'Incorrect': incorrect}, 'idx': idxs})
        else:
            return JsonResponse({'data': comp_data[int(idx)]})
        
# Get readability data
def get_read_data(request, id_):
    global DB
    col = DB.textpair
    read_data = []
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        data = col.find_one({'id':int(id_)})
        for pair in data['matches']:
            read_data.append(float(pair['read_score']))
    return JsonResponse({'data': read_data})

# Post new question to db
def post_question(request, id_, idx):
    global DB
    col = DB.textpair
    if request.user.is_authenticated:
        user = DB.user.find_one({'username': str(request.user)})
        data = col.find_one({'id':int(id_)})
        if request.method == "POST":
            context = request.POST['context']
            question = request.POST['question']
            answer = request.POST['answer']
            data = [({
                'context': context,
                'question': question
            }, answer)]

            result = comprehensibility_score(data)

            response = {
                'data': result[0],
            }

            col.update_one(
                {'id': int(id_)},
                {'$push': { 
                    f'matches.{int(idx)}.comp_score' : result[0]
                }})

            return JsonResponse(response)