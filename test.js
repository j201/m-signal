// Just some quick demos I made when developing. Need to be turned into real tests

var tape = require('tape');
var signal = require('./lib');

function counterSignal(time) {
	return signal(function loop(resolve, n) {
		n = n || 0;
		resolve(n);
		setTimeout(function() { return loop(resolve, n + 1); }, time);
	});
};

function countTo(x, time) {
	return signal(function loop(resolve, n) {
		n = n || 0;
		resolve(n);
		if (n < x) 
			setTimeout(function() { return loop(resolve, n + 1); }, time);
	});
};

function shouldProduce(t, signal, xs, message) {
	signal.fold(function(acc, x) { return acc.concat([x]); }, [])
		.listen(function(sxs) {
			if (sxs.length === xs.length)
				t.deepEqual(sxs, xs, message);
		});
}

tape("Monad laws", function(t) {
	t.plan(2);

	shouldProduce(t,
				  signal.lift(10).bind(function(x) { return countTo(x, 100); }),
				  [0,1,2,3,4,5,6,7,8,9,10],
				  "bind(lift(a), f) <=> f(a)");

	shouldProduce(t,
				  countTo(10, 100).bind(signal.lift),
				  [0,1,2,3,4,5,6,7,8,9,10],
				  "bind(m, lift) <=> m");
});

// // Monad laws:
// // Should log 0 to 10
// signal.lift(10).bind(x => countTo(x, 100)).listen(console.log.bind(console));

// // Should log 0 to 10
// countTo(10, 100).bind(signal.lift).listen(console.log.bind(console));

// var double = x => signal.lift(x*2);
// var inc = x => signal.lift(x+1);
// // Should log the same
// countTo(2, 100).bind(double).bind(inc).listen(console.log.bind(console));
// countTo(2, 100).bind(x => double(x).bind(inc)).listen(console.log.bind(console));

// // Functor laws:
// // Should log 0 to 10
// countTo(10, 100).fmap(x => x).listen(console.log.bind(console));

// // Should log 1,3,5
// countTo(2, 100).fmap(x => x*2).fmap(x => x+1).listen(console.log.bind(console));

