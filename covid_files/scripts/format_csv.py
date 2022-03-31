import csv
import os
import pandas as pd
from pathlib import Path

path = "/Users/ryanegbert/Desktop/spring22/ip/app/covid_files/csv/"
files = os.listdir(path)

for file in files:
    if Path(path + file).is_file():
        with open(path + file, 'r') as f:
            reader = csv.reader(f)
            reader_list = list(reader)
            langs = reader_list[0]
            lang_dict = {}
            for lang in range(len(langs)):
                print(lang)
                lang_dict[lang] = {'lang': langs[lang], 'sentences': []}
            print(lang_dict)
            for i in range(1,len(reader_list)):
                for j in range(len(reader_list[i])):
                    if j in lang_dict:
                        lang_dict[j]['sentences'].append(reader_list[i][j])

            print(lang_dict)
            break