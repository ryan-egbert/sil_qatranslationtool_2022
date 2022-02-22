from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('upload/', views.upload, name='upload'),
    path('upload/file/', views.processFile, name='processFile'),
    path('results/', views.results, name='results'),
    path('results/similarity/', views.similarity, name='similarity'),
    path('results/readability/', views.readability, name='readability'),
    path('results/comprehensibility/', views.comprehensibility, name='comprehensibility'),
    path('results/semanticdomain/', views.semanticdomain, name='semanticdomain'),
    path('results/view/', views.metric_view, name='view'),
    path('upload/processing/', views.processing, name='processing'),
    path('results/aboutcomprehensibility/', views.aboutcomprehensibility, name='aboutcomprehensibility'),
    path('results/aboutreadability/', views.aboutreadability, name='aboutreadability'),
    path('results/aboutsemanticdomain/', views.aboutsemanticdomain, name='aboutsemanticdomain'),
    path('results/aboutsemanticsimilarity/', views.aboutsemanticsimilarity, name='aboutsemanticsimilarity')
]
