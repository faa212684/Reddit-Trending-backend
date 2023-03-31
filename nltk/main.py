from nltk.tag import pos_tag
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from flask import Flask
from flask import request
import re
import os
import sys
import psutil

app = Flask(__name__)
wnl = WordNetLemmatizer()

os.environ['NLTK_DATA'] = '/usr/local/share'

@app.route("/")
def lemmatize():    
    """
    Tokenizes and lemmatizes the words in a given string.
    
    Args:
        string (str): The input string. Default value is an empty string.
    
    Returns:
        dict: A dictionary with three keys:
            - "adj": a list of lemmatized adjectives
            - "noun": a list of lemmatized nouns
            - "verb": a list of lemmatized verbs, excluding the verb "be"
    """
    sentence = request.args.get('string', default = '', type = str)
    wordAdj = set()
    wordNoun = set()
    wordVerb = set()
    sentence = re.sub('[^a-zA-Z0-9 \n\.]', ' ', sentence.lower())
    tokenized = word_tokenize(sentence)
    for word, tag in pos_tag(tokenized):
        if len(word) == 1:
            continue
        if tag.startswith('JJ'):
            wordAdj.add(wnl.lemmatize(word, pos='a'))
        elif tag.startswith("NN"):
            wordNoun.add(wnl.lemmatize(word, pos='n'))
        elif tag.startswith('VB') and not tag=="VBZ":
            wordVerb.add(wnl.lemmatize(word, pos='v'))

    if "be" in wordVerb:
        wordVerb.remove("be")
    return {"adj":list(wordAdj),"noun":list(wordNoun),"verb":list(wordVerb)}


def extract_person_names(sentence):
    sentence = request.args.get('string', default = '', type = str)
    tokens = nltk.tokenize.word_tokenize(sentence)
    tagged = nltk.pos_tag(tokens)
    named_entities = nltk.ne_chunk(tagged, binary=False)
    noun = []
    verb = []
    for entity in named_entities:
        if type(entity) == tuple and entity[1].startswith('VB') and not entity[1]=="VBZ":
            verb.append(wnl.lemmatize(entity[0], pos='v'))
        if type(entity) == Tree and entity.label() == 'PERSON' :
            person_name = ' '.join([word for word, tag in entity.leaves()])
            noun.append(person_name)
        if type(entity) == Tree and entity.label() == 'ORGANIZATION':
            [noun.append(word) for word, tag in entity.leaves()]
    return {"noun":noun,"verb":verb}

@app.route("/memory_usage")
def memory_usage():
    process = psutil.Process(os.getpid())
    app_memory = process.memory_info().rss / 1024 ** 2  # Memory usage in MB
    wnl_memory = sys.getsizeof(wnl) / 1024 ** 2  # Memory usage in MB
    return {
        "app_memory_usage_mb": app_memory,
        "wnl_memory_usage_mb": wnl_memory
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5004)