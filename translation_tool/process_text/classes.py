import warnings
from datetime import datetime
import hashlib
import os

class TextPair:
    def __init__(self, source_list, translated_list, sim_scores, read_scores, comp_scores, _id=-1, options=['s','c','r','d'], user=None, source_lang=None, translated_lang=None):
        self._id = _id
        self._datetime = datetime.now()
        self._source = source_list
        self._translated = translated_list
        self._sim_scores = sim_scores
        self._read_scores = read_scores
        self._comp_scores = comp_scores
        self._options = options
        self._user = user
        print(read_scores)

        self.dict = self.organize()

    def organize(self):
        matches = []
        warn = []
        if len(self._source) != len(self._translated):
            warn.append("Source text and translated text have different lengths.")
            warnings.warn("Source text and translated text have different lengths.")
        for idx in range(len(self._source)):
            simcolor = "#fff"
            compcolor = "#fff"
            readcolor = "#fff"
            semdomcolor = "#fff"
            if self._sim_scores[idx] < 3.7:
                simcolor = "#f00"
            elif self._sim_scores[idx] < 4.3:
                simcolor = "#ffe587"
            if self._read_scores[idx] < 8:
                readcolor = "#f00"
            elif self._read_scores[idx] < 15:
                readcolor = "#ffe587"
            matches.append({
                'source': self._source[idx],
                'translated': self._translated[idx],
                'sim_score': str(round(self._sim_scores[idx],1)),
                'comp_score': 0,
                'read_score': str(round(self._read_scores[idx],2)),
                'comp_score': [self._comp_scores[idx]] if self._comp_scores[idx] is not None else [],
                'semdom_score': 0,
                'idx': idx,
                'simcolor': simcolor,
                'compcolor': compcolor,
                'readcolor': readcolor,
                'semdomcolor': semdomcolor,
            })

        return {
            'id': self._id,
            'datetime': str(self._datetime),
            'matches': matches,
            'options': self._options,
            'warning': warn,
            'user': self._user['username'],
        }

class UserMongo:
    def __init__(self, username, password, email, first_name, last_name):
        self._username = username
        self._salt = os.urandom(32)
        self._password = self.hash(password)
        self._first_name = first_name
        self._last_name = last_name
        self._email = email
        self._translations = []
        self.dict = {
            'username': self._username,
            'salt': self._salt,
            'password': self._password,
            'translations': self._translations,
            'fname': self._first_name,
            'lname': self._last_name,
            'email': self._email
        }
    
    def hash(self, password):
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            self._salt, 100000
        )
        return self._salt + key