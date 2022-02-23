from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('register/process/', views.process_registration, name='process_registration'),
    path('login/', views.login, name='loginuser'),
    path('login/process/', views.process_login, name='process_login'),
    path('upload/', views.upload, name='upload'),
    path('upload/text/', views.processText, name='processText'),
    path('upload/file/', views.processFile, name='processFile'),
    path('results/', views.results, name='results'),
    # path('results/similarity/', views.similarity, name='similarity'),
    # path('results/readability/', views.readability, name='readability'),
    # path('results/comprehensibility/', views.comprehensibility, name='comprehensibility'),
    # path('results/semanticdomain/', views.semanticdomain, name='semanticdomain'),
    path('results/view/', views.metric_view, name='view'),
    path('upload/processing/', views.processing, name='processing'),
    path('about/comprehensibility/', views.aboutcomprehensibility, name='aboutcomprehensibility'),
    path('about/readability/', views.aboutreadability, name='aboutreadability'),
    path('about/semanticdomain/', views.aboutsemanticdomain, name='aboutsemanticdomain'),
    path('about/similarity/', views.aboutsemanticsimilarity, name='aboutsemanticsimilarity')
]
 