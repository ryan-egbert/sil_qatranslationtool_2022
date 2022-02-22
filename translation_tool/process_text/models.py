from django.db import models
# # from djongo.models.indexes import TextIndex
# from djongo import models
# from django import forms

# # Create your models here.

# #####################################################
# ##### TextPair Models
# #####################################################

# class Sentence(models.Model):
#     text = models.TextField()
#     class Meta:
#         abstract = True

# class SentenceForm(forms.ModelForm):
#     class Meta:
#         model = Sentence
#         fields = ('text',)

# class Text(models.Model):
#     sentences = models.ArrayField(
#         model_container=Sentence,
#         # model_form_class=SentenceForm
#     )
#     lang = models.CharField(max_length=255)
#     class Meta:
#         abstract=True

# class TextForm(forms.ModelForm):
#     class Meta:
#         model = Text
#         fields = ('sentences','lang')

# class Score(models.Model):
#     score = models.IntegerField()
#     class Meta:
#         abstract=True

# class Scores(models.Model):
#     scores = models.ArrayField(
#         model_container=Score
#     )
#     class Meta:
#         abstract=True

# class TextPair(models.Model):
#     _id = models.ObjectIdField()
#     pair_id = models.IntegerField()
#     source = models.EmbeddedField(
#         model_container=Text,
#         model_form_class=TextForm
#     )
#     translated = models.EmbeddedField(
#         model_container=Text,
#         model_form_class=TextForm
#     )
#     scores = models.EmbeddedField(
#         model_container=Scores,
#     )
#     objects = models.DjongoManager()

# class TextPairForm(forms.ModelForm):
#     class Meta:
#         model = TextPair
#         fields = ('pair_id','source','translated')

# #####################################################

# #####################################################
# ##### User Models
# #####################################################

# class User(models.Model):
#     salt = models.CharField(max_length=128)
#     email = models.CharField(max_length=255)
#     username = models.CharField(max_length=255)
#     password = models.CharField(max_length=255)
#     full_name = models.CharField(max_length=255)

#     translations = models.ArrayField(
#         model_container=TextPair,
#         model_form_class=TextPairForm
#     )

#     objects = models.DjongoManager()

# #####################################################
class File(models.Model):
    existingPath = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=50)
    eof = models.BooleanField()