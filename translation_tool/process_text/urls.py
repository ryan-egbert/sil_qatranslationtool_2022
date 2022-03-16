from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('register/process/', views.process_registration, name='process_registration'),
    path('login/', views.login_view, name='loginuser'),
    path('login/process/', views.process_login, name='process_login'),
    path('logout/', views.process_logout, name="process_logout"),
    path('user/account/', views.account_settings, name='account_settings'),
    path('upload/', views.upload, name='upload'),
    path('upload/text/', views.processText, name='processText'),
    path('upload/file/', views.processFile, name='processFile'),
    path('results/', views.results, name='results'),
    # path('results/view/', views.metric_view, name='view'),
    # path('upload/processing/', views.processing, name='processing'),
    path('about/comprehensibility/', views.aboutcomprehensibility, name='aboutcomprehensibility'),
    path('about/readability/', views.aboutreadability, name='aboutreadability'),
    path('about/semanticdomain/', views.aboutsemanticdomain, name='aboutsemanticdomain'),
    path('about/similarity/', views.aboutsemanticsimilarity, name='aboutsemanticsimilarity'),
    path('api/simData/', views.get_sim_data, name='simData'),
    path('api/compData/<str:idx>', views.get_comp_data, name='compData'),
    path('api/readData/', views.get_read_data, name='readData'),
    path('api/semdomData/', views.get_semdom_data, name='semdomData'),
]
 