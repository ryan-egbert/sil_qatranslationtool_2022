from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from colour import Color
from random import choice

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

def results(request):
    context = {
        'sidebar': True
    }
    return render(request, 'process_text/results.html', context)

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