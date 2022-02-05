from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from colour import Color
from random import choice, shuffle

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

def results(request):
    context = {
        'sidebar': True
    }
    return render(request, 'process_text/results.html', context)

def comprehensibility(request):
    red = Color("#ff8585")
    green = Color("#87c985")
    colors = list(red.range_to(green, 10))
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
    sentences_s = [
        "Handwashing is one of the best ways to protect yourself and your family from getting sick",
        "Look for emergency warning signs - Trouble breathing, Persistent pain or pressure in the chest, New confusion, Inability to wake",
        "When the virus enters the heart, it can cause clots, pulmonary embolism, or clots within the arteries of the heart causing a heart attack",
    ]
    sentences_t = [
        "Should I use soap and water or hand sanitizer to protect against COVID-19?",
        "When should I seek emergency care if I have COVID-19?",
        "Does COVID-19 affect the heart?",
    ]
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
    sentences_r = [
        "The bird had a belief that it was really a groundhog.",
        "Sometimes I stare at a door or a wall and I wonder what is this reality, why am I alive, and what is this all about?",
        "Her daily goal was to improve on yesterday.",
        "His confidence would have bee admirable if it wasn't for his stupidity.",
        "It was the first time he had ever seen someone cook dinner on an elephant.",
        "He said he was not there yesterday; however, many people saw him there.",
        "He had decided to accept his fate of accepting his fate.",
        "She was too short to see over the fence.",
        "He wondered why at 18 he was old enough to go to war, but not old enough to buy cigarettes.",
        "The overpass went under the highway and into a secret world.",
    ]
    all_sentences = []
    for i in range(len(sentences_r)):
        all_sentences.append({
            's': sentences_r[i],
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
    sentences_tr = [
        "The bird had a belief that it was really a groundhog.",
        "Sometimes I stare at a door or a wall and I wonder what is this reality, why am I alive, and what is this all about?",
        "Her daily goal was to improve on yesterday.",
        "His confidence would have bee admirable if it wasn't for his stupidity.",
        "It was the first time he had ever seen someone cook dinner on an elephant.",
        "He said he was not there yesterday; however, many people saw him there.",
        "He had decided to accept his fate of accepting his fate.",
        "She was too short to see over the fence.",
        "He wondered why at 18 he was old enough to go to war, but not old enough to buy cigarettes.",
        "The overpass went under the highway and into a secret world.",
    ]
    all_sentences = []
    for i in range(len(sentences_tr)):
        all_sentences.append({
            's': sentences_tr[i],
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
    sentences_s = [
        "The bird had a belief that it was really a groundhog.",
        "Sometimes I stare at a door or a wall and I wonder what is this reality, why am I alive, and what is this all about?",
        "Her daily goal was to improve on yesterday.",
        "His confidence would have bee admirable if it wasn't for his stupidity.",
        "It was the first time he had ever seen someone cook dinner on an elephant.",
        "He said he was not there yesterday; however, many people saw him there.",
        "He had decided to accept his fate of accepting his fate.",
        "She was too short to see over the fence.",
        "He wondered why at 18 he was old enough to go to war, but not old enough to buy cigarettes.",
        "The overpass went under the highway and into a secret world.",
    ]
    sentences_t = [
        "L'oiseau croyait qu'il s'agissait en fait d'une marmotte.",
        "Parfois, je fixe une porte ou un mur et je me demande quelle est cette réalité, pourquoi suis-je en vie et de quoi s'agit-il?",
        "Son objectif quotidien était de s'améliorer par rapport à hier.",
        "Sa confiance aurait été admirable s'il n'y avait pas eu sa bêtise.",
        "C'était la première fois qu'il voyait quelqu'un cuisiner un dîner sur un éléphant.",
        "Il a dit qu'il n'était pas là hier, mais beaucoup de gens l'ont vu là-bas.",
        "Il avait décidé d'accepter son sort d'accepter son sort.",
        "Elle était trop petite pour voir par-dessus la clôture.",
        "Il s'est demandé pourquoi à 18 ans il était assez vieux pour faire la guerre, mais pas assez pour acheter des cigarettes.",
        "Le viaduc est passé sous l'autoroute et dans un monde secret.",
    ]
    all_sentences = []
    for i in range(10):
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
