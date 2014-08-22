#m-signal

Monadic signals for asynchronous and reactive programming. Still under development, but should be usable.

##API

**signal(source)**

Creates a signal. `source` should be a function that takes one argument: a function that `source` calls when it wants to add a value to the signal.

**signal.lift(value)**

Creates a signal with `value` as its only value. (Part of being a monad, and equivalent to monadic `return`.)

**signal.combine(...signals)**

Takes a number of signals and combines them into one signal that broadcasts the current value of each signal as an array when any signal changes.

**signal.flift(f)**

Takes a function and returns an equivalent where each argument and the return value are all signals containing the same type as the original function.

###Methods of signals

In the following descriptions, `s` is any signal. All methods return a new signal except for `listen`.

**s.fmap(f)**

Returns a signal with every value broadcast by `s` passed through the function `f`. Analogous to `map` for arrays.

**s.bind(f)**

`f` should be a function that takes a value broadcast by `s` and returns a signal. The signal returned by `bind` then broadcasts the values of these signals whenever one of them updates.

**s.fold(f, i)**

For each value from `f`, passes the previous return value of `f` and the new value to `f` and broadcasts the return value. `i` is used as the initial first argument to `f`.

**s.apply(s2)**

This only works if the values of `s` are functions. When `s` or `s2` is updated, broadcasts the result of calling the current value of `s` with the current value of `s2`.

**s.listen(f)**

Whenever `s` broadcasts a value, `f` is called with that value. Note that the value can be the same as the previous one and that if `s` has already broadcast a value when `listen` is called, `f` will be immediately called with the current value of `s`.

###Types

(In my own imagined TypeScript/Haskell hybrid type system, hopefully it's comprehensible.)

```
type Signal<T> = {
	fmap: <U> (T => U) => Signal<U>,
	bind: <U> (T => Signal<U>) => Signal<U>,
	fold: <U> ((U, T) => U, U) => Signal<U>,
	apply: <U => V = T> Signal<U> => Signal<V>,
	listen: (T => void) => void
};
signal :: <T> ((T => void) => void) => Signal<T>;
signal.lift :: <U> U => Signal<U>
signal.combine :: <T, U,...> [Signal<T>, Signal<U>,...] => Signal<[T, U,...]>
signal.flift :: <T, U,...,R> ((T, U,...) => R) => ((Signal<T>, Signal<U>,...) => Signal<R>)
```

##Examples

###FRP

```
var signal = require('msignal');

function mouseSignal() {
	return signal(function(resolve) {
		window.addEventListener("mouseup", function(e) { resolve(false); });
		window.addEventListener("mousedown", function(e) { resolve(true); });
	});
}

// Logs the number of clicks
mouseSignal()
	.fold(function(sum, mouse) { return mouse ? sum + 1 : sum; }, 0)
	.listen(console.log.bind(console));
```

###Promise-y

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
