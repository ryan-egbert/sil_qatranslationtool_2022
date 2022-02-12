from .models import TextPair
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger 

class TextClass:
    def __init__(self, text, lang=None, section_breaks=False):
        self._text = text
        self._lang = lang
        self._breaks = section_breaks

    def get_text(self): return self._text
    def get_lang(self): return self._lang

class TextPairClass:
    def __init__(self, source, translated, _id=None):
        self._source = TextClass(source)
        self._translated = TextClass(translated)
        self._id = _id

    def get_source(self): return self._source
    def _get_source_for_model(self):
        for_model = []
        for s in self._source.get_text():
            for_model.append({'text': s})
        return for_model
    def get_translated(self): return self._translated
    def _get_translated_for_model(self):
        for_model = []
        for s in self._translated.get_text():
            for_model.append({'text': s})
        return for_model
    def swap_source(self, new_source): self._source = new_source
    def swap_translated(self, new_translated): self._translated = new_translated

    def to_model(self):
        tp = TextPair()
        tp.source = {
            'sentences': self._get_source_for_model(),
            'lang': self._source.get_lang()
        }
        tp.translated = {
            'sentences': self._get_translated_for_model(),
            'lang': self._translated.get_lang()
        }
        tp.pair_id = self._id

        return tp

