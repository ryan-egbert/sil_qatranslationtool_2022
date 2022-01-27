import json
import os
import pandas as pd
from pathlib import Path

path = "/Users/ryanegbert/Desktop/spring22/ip/app/covid_files_clean/"
files = os.listdir(path)

for file in files:
    if Path(path + file).is_file():
        with open(path + file, 'r') as f:
            data = json.load(f)
            book_instance_id = data["bookInstanceId"]
            title = data["title"]
            languages = data["contentLanguages"]
            book_samples = data["bookSamples"]
            book_text = data["bookText"]
            _data = {}
            for key in languages:
                _data[key] = []
            
            for key in book_samples:
                # if key.isnumeric():
                cur = book_samples[key]
                for lang in languages:
                    if lang in cur:
                        _data[lang].append(cur[lang].replace('\n', ' '))
                    else:
                        _data[lang].append(None)

            for lang in languages:
                if lang in book_text:
                    _data[lang].append(book_text[lang].replace('\n', ' '))
                else:
                    _data[lang].append(None)

            df = pd.DataFrame.from_dict(_data)
            df = df.drop_duplicates()
            df.to_csv("./csv/{}.{}.csv".format(book_instance_id,title.replace(' ','_')))
            # break