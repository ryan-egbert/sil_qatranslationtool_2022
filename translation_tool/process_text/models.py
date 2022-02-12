# from django.db import models
# from djongo.models.indexes import TextIndex
from djongo import models
from django import forms

# Create your models here.

# class User(models.Model):

class Sentence(models.Model):
    text = models.TextField()
    class Meta:
        abstract = True

class SentenceForm(forms.ModelForm):
    class Meta:
        model = Sentence
        fields = ('text',)

class Text(models.Model):
    sentences = models.ArrayField(
        model_container=Sentence,
        model_form_class=SentenceForm
    )
    lang = models.CharField(max_length=255)
    class Meta:
        abstract=True

class TextForm(forms.ModelForm):
    class Meta:
        model = Text
        fields = ('sentences','lang')

class TextPair(models.Model):
    _id = models.ObjectIdField()
    pair_id = models.IntegerField()
    source = models.EmbeddedField(
        model_container=Text,
        model_form_class=TextForm
    )
    translated = models.EmbeddedField(
        model_container=Text,
        model_form_class=TextForm
    )
    objects = models.DjongoManager()

