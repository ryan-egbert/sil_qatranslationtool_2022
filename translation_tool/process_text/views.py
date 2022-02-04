from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

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

def results(request):
    return render(request, 'process_text/results.html')


def similarity(request):
    return render(request, 'process_text/similarity.html')

def comprehensibility(request):
    return render(request, 'process_text/comprehensibility.html')

