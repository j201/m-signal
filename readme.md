#msignal

Monadic signals for asynchronous and reactive programming

---

Yay, I maded something with monads!

##Example usage

```
var signal = require('msignal');

function ajaxGet(url) {
	return signal(function(resolve) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200)
				resolve(xhr.responseText);
		};
		xhr.send();
	});
}

ajaxGet("http://reddit.com/r/javascript/about.json")
	.fmap(function(json) {
		return JSON.parse(json).data.description_html;
	})
	.listen(console.log.bind(console));
```
