from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader
from colour import Color
from random import choice, shuffle
from .models import TextPair

LANG1 = []
LANG2 = []
ID = 5

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

def register(request):
    #context = {'header': 'Hello 1234'}
    return render(request, 'process_text/register.html')

def upload(request):
    context = {}
    return render(request, 'process_text/upload.html')

def processFile(request):
    # if request.method == 'POST':
    #     upload_file = request.FILES['uploadFile']
    #     first_line = True
    #     lang1_lines = []
    #     lang2_lines = []
    #     # with open(upload_file, 'r') as f:
    #     for line in upload_file:
    #         if first_line:
    #             langs = line.decode().split(',')
    #             lang1 = langs[1]
    #             lang2 = langs[2]
    #             first_line = False
    #             continue
    #         lang1_lines.append({'text': line.decode().split(',')[1]})
    #         lang2_lines.append({'text': line.decode().split(',')[2]})

    # tp = TextPair()
    # tp.text1 = {
    #     'sentences': lang1_lines,
    #     'lang': 'eng'
    # }
    # tp.text2 = {
    #     'sentences': lang2_lines,
    #     'lang': 'eng'
    # }
    # tp.tp_id = ID
    # tp.save()
    # return redirect('/index/results')
    return results(request)

def results(request):
    tp = TextPair.objects.get(tp_id=ID)
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
    tp = TextPair.objects.get(tp_id=ID)
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
    tp = TextPair.objects.get(tp_id=ID)
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
    tp = TextPair.objects.get(tp_id=ID)
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
    tp = TextPair.objects.get(tp_id=ID)
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
