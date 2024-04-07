from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
from collections import Counter
from nltk import pos_tag
import spacy

nlp = spacy.load("en_core_web_sm")

def preprocess_text(text):
    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents]
    stop_words = set(stopwords.words('english'))
    words = [token.text.lower() for token in doc if token.is_alpha and token.text.lower() not in stop_words]
    return sentences, words

def extract_keywords(text, num_keywords=5):
    words = word_tokenize(text)
    pos_tags = pos_tag(words)
    stopwords_set = set(stopwords.words('english'))
    keywords = [word for word, pos in pos_tags if word.lower() not in stopwords_set and word.isalpha()]

    keyword_counts = Counter(keywords)
    most_common_keywords = keyword_counts.most_common(num_keywords)
    
    return [keyword for keyword, count in most_common_keywords]

def calculate_word_frequencies(words):
    word_frequencies = FreqDist(words)
    return word_frequencies

def calculate_sentence_scores(sentences, word_frequencies):
    sentence_scores = {}

    for i, sentence in enumerate(sentences):
        for word, freq in word_frequencies.items():
            if word in sentence.lower():
                if i not in sentence_scores:
                    sentence_scores[i] = freq
                else:
                    sentence_scores[i] += freq

    return sentence_scores

app = Flask(__name__)

@app.route('/summary')
def summary_api():
    url = request.args.get('url', '')
    print(url)
    video_id = url.split('=')[1]
    slider_value = request.args.get('sliderValue', '')
    summary = get_summary(get_transcript(video_id), slider_value)
    return summary

def get_transcript(video_id):
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    transcript = ' '.join([d['text'] for d in transcript_list])
    return transcript

def get_summary(transcript, summary_percentage):
    text = transcript 
    sentences, words = preprocess_text(text)
    word_frequencies = calculate_word_frequencies(words)
    sentence_scores = calculate_sentence_scores(sentences, word_frequencies)

    total_sentences = len(sentences)
    num_sentences = int(total_sentences * (float(summary_percentage) / 100))

    sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
    summary_sentences = [sentences[i] for i, _ in sorted_sentences[:num_sentences]]
    summary = ' '.join(summary_sentences)
    
    keywords = extract_keywords(summary, num_keywords=6)

    return jsonify({'summary': summary, 'keywords': keywords})

if __name__ == '__main__':
    app.run()
