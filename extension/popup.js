function embedYouTubeVideo(videoId) {
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = `<img width="450" height="160" src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="Video Thumbnail">`;
    
    // Create the iframe element but keep it hidden until the video content is loaded
    const iframe = document.createElement('iframe');
    iframe.width = '450';
    iframe.height = '160';
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.frameborder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowfullscreen = true;
    iframe.onload = function() {
        videoContainer.innerHTML = ''; // Remove the placeholder image once the iframe is loaded
        videoContainer.appendChild(iframe); // Append the iframe to the container
    };
}


  function extractVideoId(url) {
    var videoId = '';
    var match = url.match(/[?&]v=([^&]+)/);
    if (match) {
      videoId = match[1];
    } else {
     alert("Please open Youtube first")
    }
    return videoId;
  }
  function initializeExtension() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var urll = tabs[0].url;
        var videoId = extractVideoId(urll);
        embedYouTubeVideo(videoId);
    });
}

document.addEventListener('DOMContentLoaded',initializeExtension);
function summarize() {
    var sliderValue = document.getElementById('summaryLengthSlider').value;
    document.getElementById('sliderValue').innerText = " "+ sliderValue+"% "; 
    btn.innerHTML = "Summarising...";
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var urll = tabs[0].url;
        var sliderValue = document.getElementById('summaryLengthSlider').value;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://127.0.0.1:5000/summary?url=" + urll+ "&sliderValue=" + sliderValue, true);
        xhr.onload = function() {
                       
            var jsonResponse = JSON.parse(xhr.responseText);
            const summary = jsonResponse.summary;
            const keywords = jsonResponse.keywords;
            document.getElementById('summary').style.display = 'block';
            document.getElementById('keywords').style.display = 'block';
            document.getElementById("summary").innerHTML = summary;
            document.getElementById('keywords').innerText = "Keywords: " + keywords.join(" , ");
            
            btn.innerHTML = "Summarise";
        }
        xhr.send();
    });
}

document.getElementById('summaryLengthSlider').addEventListener('click', function()
{
    var sliderValue = document.getElementById('summaryLengthSlider').value;
    document.getElementById('sliderValue').innerText = " "+ sliderValue+"%"; 
    
});
const btn = document.getElementById("summarizeBtn");
btn.addEventListener("click", function() {

    document.getElementById('summaryLengthSlider').addEventListener('click', summarize);
    summarize();
    });

