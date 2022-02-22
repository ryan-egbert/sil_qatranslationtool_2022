import warnings
from datetime import datetime
import hashlib
import os

class TextPair:
    def __init__(self, source_list, translated_list, sim_scores, _id=-1, options=['s','c','r','d'], source_lang=None, translated_lang=None):
        self._id = _id
        self._datetime = datetime.now()
        self._source = source_list
        self._translated = translated_list
        self._sim_scores = sim_scores
        self._options = options

        self.dict = self.organize()

    def organize(self):
        matches = []
        warn = []
        if len(self._source) != len(self._translated):
            warn.append("Source text and translated text have different lengths.")
            warnings.warn("Source text and translated text have different lengths.")
        for idx in range(len(self._source)):
            color = "#fff"
            if self._sim_scores[idx] < 75:
                color = "#f00"
            elif self._sim_scores[idx] < 85:
                color = "#ffe587"

            matches.append({
                'source': self._source[idx],
                'translated': self._translated[idx],
                'sim_score': self._sim_scores[idx],
                'idx': idx,
                'color': color,
            })

        return {
            'id': self._id,
            'datetime': self._datetime,
            'matches': matches,
            'options': self._options,
            'warning': warn
        }

class User:
    def __init__(self, username, password):
        self._username = username
        self._salt = os.urandom(32)
        self._password = self.hash(password)
        self._translations = []
        self.dict = {
            'username': self._username,
            'salt': self._salt,
            'password': self._password,
            'translations': self._translations
        }
    
    def hash(self, password):
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            self._salt, 100000
        )
        return self._salt + key


