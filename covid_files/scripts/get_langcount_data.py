import pandas as pd
import os
import matplotlib.pyplot as plt

covid_path = "/Users/ryanegbert/Desktop/spring22/ip/app/covid_files/"
iso = pd.read_csv("{}iso639-3.csv".format(covid_path))
print(iso.head())
files = os.listdir("{}csv/".format(covid_path))

lang_counts = {}

for file in files:
    df = pd.read_csv("{}csv/{}".format(covid_path, file))
    langs = df.columns
    for lang in langs:
        if lang != 'Unnamed: 0':
            if lang in lang_counts:
                lang_counts[lang] += 1
            else:
                lang_counts[lang] = 1

with open("{}lang_counts.csv".format(covid_path), 'w') as f:
    for lang in lang_counts:
        long_form_lang = iso[iso['Id'] == lang]['Ref_Name']
        if long_form_lang.size > 0:
            out_lang = long_form_lang.iloc[0]
        else:
            out_lang = lang
        f.write("{},{}\n".format(out_lang, str(lang_counts[lang])))