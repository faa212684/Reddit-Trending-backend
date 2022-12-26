from nltk.tag import pos_tag
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from flask import Flask
from flask import request
import re

app = Flask(__name__)
wnl = WordNetLemmatizer()

#@app.route("/<sentence>")
@app.route("/")
def lemmatize():    
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
        

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5004, debug=True)