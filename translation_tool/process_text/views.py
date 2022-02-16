from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader
from colour import Color
from random import choice, shuffle
from .models import TextPair, User
from .classes import TextPairClass
import csv
import io
import os
import random
import hashlib

LANG1 = []
LANG2 = []
ID = 0


reader = csv.reader(open('/Users/ryanegbert/Desktop/spring22/ip/app/covid_files/csv/test_file.csv', 'r'))
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
# ID = random.randint(10000,99999)
TP = TextPairClass(source_text, translated_text, _id=-1)


# Create your views here.
def index(request):
    context = {
        'source_txt': 'This is source text',
        'trans_txt': 'This is translated text'
    }
    return render(request, 'process_text/index.html', context)

def login(request):
    context = {'header': 'Hello 1234'}
    return render(request, 'process_text/login.html', context)

def hash_pass(password, salt):
    key = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt, 100000)

    return list(key)

def process_login(request):
    username = request.GET['username']
    password = request.GET['password']

    user = User.objects.get(username=username)
    user_pass = user.password.split(' ')
    user_pass_int = [int(i) for i in user_pass]
    user_salt = user.salt.split(' ')
    user_salt_bytes = bytes([int(i) for i in user_salt])

    # user_pass
    key = hash_pass(password, user_salt_bytes)
    
    # print(key)
    # print(user_pass_int[32:])

    if key == user_pass_int[32:]:
        return redirect('upload')
    else:
        return redirect('loginuser')

def register(request):
    #context = {'header': 'Hello 1234'}
    return render(request, 'process_text/register.html')

def process_registration(request):
    if request.method == 'POST':
        username = request.POST['username']
        full_name = request.POST['fullname']
        password = request.POST['password']
        salt = os.urandom(32)
        key = hash_pass(password, salt)
        salt_list = list(salt)
        user = User()
        user.username = username
        salt_list_str = [str(i) for i in salt_list]
        key_str = [str(i) for i in key]
        user.password = ' '.join(salt_list_str + key_str)
        user.salt = ' '.join(salt_list_str)
        user.save()

    return redirect('register')

def upload(request):
    context = {}
    return render(request, 'process_text/upload.html')

def processFile(request):
    global TP
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
        ID = random.randint(10000,99999)
        text_pair = TextPairClass(source_text, translated_text, _id=ID)
        tp = text_pair.to_model()
        tp.save()

    text_pair = TP

    return processing(request, text_pair, None)

def processing(request, text_pair, options):
    context = {}
    return render(request, 'process_text/processing.html', context)

def results(request):
    # tp = TextPair.objects.get(pair_id=ID)
    tp = TP.to_model()
    context = {
        'sidebar': True
    }
    return render(request, 'process_text/results.html', context)

def comprehensibility(request):
    red = Color("#ff8585")
    white = Color("white")
    colors = list(red.range_to(white, 3))
    random_questions = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat?',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur?',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum?'
    ]
    random_answers = [
        'consectetur',
        'enim',
        'reprehenderit',
        'proident'
    ]
    tp = TextPair.objects.get(pair_id=ID)
    t1_sent = tp.text1['sentences']
    t2_sent = tp.text2['sentences']
    sentences_s = []
    sentences_t = []
    for text in t1_sent:
        sentences_s.append(text['text'])
    for text in t2_sent:
        sentences_t.append(text['text'])
    all_sentences = []
    for i in range(len(sentences_s)):
        all_sentences.append({
            's': sentences_s[i],
            't': sentences_t[i],
            'color': choice(colors).hex,
            'idx': i,
        })

    all_questions = []
    for i in range(len(sentences_s)):
        questions = []
        questions.append({
            'question': choice(random_questions),
            'answer': choice(random_answers),
            'color': choice(colors)
        })
        all_questions.append(questions)
    context = {
        'sentences': all_sentences,
        'questions': all_questions,
        'sidebar': True,
    }

    return render(request, 'process_text/comprehensibility.html', context)

def readability(request):
    red = Color("#ff8585")
    green = Color("#87c985")
    colors = list(red.range_to(green, 10))
    tp = TextPair.objects.get(pair_id=ID)
    t1_sent = tp.text1['sentences']
    t2_sent = tp.text2['sentences']
    sentences_s = []
    sentences_t = []
    for text in t1_sent:
        sentences_s.append(text['text'])
    for text in t2_sent:
        sentences_t.append(text['text'])
    all_sentences = []
    for i in range(len(sentences_t)):
        all_sentences.append({
            's': sentences_t[i],
            'color': choice(colors).hex,
            'idx': i,
        })
    context = {
        'sentences': all_sentences,
        'sidebar': True,
    }
    return render(request, 'process_text/readability.html', context)

def semanticdomain(request):
    red = Color("#ff8585")
    green = Color("#87c985")
    colors = list(red.range_to(green, 10))
    tp = TextPair.objects.get(pair_id=ID)
    t1_sent = tp.text1['sentences']
    t2_sent = tp.text2['sentences']
    sentences_s = []
    sentences_t = []
    for text in t1_sent:
        sentences_s.append(text['text'])
    for text in t2_sent:
        sentences_t.append(text['text'])
    all_sentences = []
    for i in range(len(sentences_t)):
        all_sentences.append({
            's': sentences_t[i],
            'color': choice(colors).hex,
            'idx': i,
        })
    context = {
        'sentences': all_sentences,
        'sidebar': True,
    }
    return render(request, 'process_text/semanticdomain.html', context)

def similarity(request):
    red = Color("#ff8585")
    green = Color("#87c985")
    colors = list(red.range_to(green,10))
    tp = TextPair.objects.get(pair_id=ID)
    t1_sent = tp.text1['sentences']
    t2_sent = tp.text2['sentences']
    sentences_s = []
    sentences_t = []
    for text in t1_sent:
        sentences_s.append(text['text'])
    for text in t2_sent:
        sentences_t.append(text['text'])
    all_sentences = []
    for i in range(len(sentences_s)):
        all_sentences.append({
            's' : sentences_s[i],
            't' : sentences_t[i],
            'color' : choice(colors).hex,
            'idx': i,
        })
    context = {
        'sentences': all_sentences,
        'sidebar': True,
    }
    return render(request, 'process_text/similarity.html', context)

def metric_view(request):
    red = Color("#ff1212")
    white = Color("#ffffff")
    colors = list(red.range_to(white,3))
    # text_pair = TextPairClass()
    # tp = TextPair.objects.get(pair_id=ID)
    tp = TP.to_model()
    t1_sent = tp.source['sentences']
    t2_sent = tp.translated['sentences']
    sentences_s = []
    sentences_t = []
    for text in t1_sent:
        sentences_s.append(text['text'])
    for text in t2_sent:
        sentences_t.append(text['text'])
    all_sentences = []
    for i in range(len(sentences_s)):
        all_sentences.append({
            's' : (sentences_s[i],sentences_t[i]),
            'color' : choice(colors).hex,
            'idx': i,
        })
    context = {
        'sentences': all_sentences,
        'sidebar': True,
    }
    return render(request, 'process_text/metric_view.html', context)