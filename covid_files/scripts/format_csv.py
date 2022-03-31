import csv
import os
import pandas as pd
from pathlib import Path

old_path = "/Users/ryanegbert/Desktop/spring22/ip/app/covid_files/old_csv/"
new_path = "/Users/ryanegbert/Desktop/spring22/ip/app/covid_files/csv/"
files = os.listdir(old_path)

for file in files:
    if Path(old_path + file).is_file():
        with open(new_path + 'formatted_' + file, 'w') as o:
            with open(old_path + file, 'r') as f:
                reader = csv.reader(f)
                reader_list = list(reader)
                langs = reader_list[0]
                lang_dict = {}
                for lang in range(len(langs)):
                    lang_dict[lang] = {'lang': langs[lang], 'sentences': []}
                for i in range(1,len(reader_list)):
                    for j in range(len(reader_list[i])):
                        if j in lang_dict:
                            lang_dict[j]['sentences'].append(reader_list[i][j])

                o.write('source,translated,question,answer\n')
                try:
                    for i in range(len(lang_dict[0]['sentences'])):
                        s_sen = lang_dict[0]['sentences'][i]
                        t_sen = lang_dict[1]['sentences'][i]
                        o.write(f'"{s_sen}","{t_sen}",,\n')
                except KeyError:
                    print(f'File {file} is not compatible.')