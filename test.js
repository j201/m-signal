var tape = require('tape');
var signal = require('./lib');

function countTo(x, time) {
	return signal(function loop(resolve, n) {
		n = n || 0;
		resolve(n);
		if (n < x) 
			setTimeout(function() { return loop(resolve, n + 1); }, time);
	});
}

function shouldProduce(t, signal, xs, message) {
	signal.fold(function(acc, x) { return acc.concat([x]); }, [])
		.listen(function(sxs) {
			if (sxs.length === xs.length)
				t.deepEqual(sxs, xs, message);
		});
}

tape("Monad laws", function(t) {
	t.plan(3);

	shouldProduce(t,
				  signal.lift(2).bind(function(x) { return countTo(x, 0); }),
				  [0,1,2],
				  "bind(lift(a), f) <=> f(a)");

	shouldProduce(t,
				  countTo(2, 0).bind(signal.lift),
				  [0,1,2],
				  "bind(m, lift) <=> m");
	
	var sDouble = function(x) { return signal.lift(x*2); };
	var sInc = function(x) { return signal.lift(x+1); };

	shouldProduce(t,
				  countTo(2, 0).bind(function(x) { return sDouble(x).bind(sInc); }),
				  [1,3,5],
				  "bind(bind(m, f), g) <=> bind(m, x => bind(f(x), g))");
});

tape("Functor laws", function(t) {
	t.plan(2);

	shouldProduce(t,
				  countTo(2, 0).fmap(function(x) { return x; }),
				  [0,1,2],
				  "fmap(x => x) <=> x => x");
	
	shouldProduce(t,
				  countTo(2, 0).fmap(function(x) { return x*2; }).fmap(function(x) { return x+1; }),
				  [1,3,5],
				  "fmap(comp(f, g)) <=> comp(fmap(f), fmap(g))");
});

tape("Applicative laws", function(t) {
	t.plan(4);

	shouldProduce(t,
				  signal.lift(function(x) { return x; }).apply(countTo(2, 0)),
				  [0,1,2],
				  "apply(lift(x => x), s) <=> s");
	
	var sDouble = signal.lift(function(x) { return x*2; });
	var sInc = signal.lift(function(x) { return x+1; });
	shouldProduce(t,
				  signal.lift(function(f) { return function(g) { return function(x) { return f(g(x)); }; }; })
					.apply(sDouble).apply(sInc).apply(countTo(2, 0)),
				  [2, 4, 6],
				  "lift(comp).apply(s).apply(t).apply(u) <=> s.apply(t.apply(u))");

	shouldProduce(t,
				  sDouble.apply(signal.lift(2)),
				  [4],
				  "lift(f).apply(lift(x)) <=> lift(f(x))");

	shouldProduce(t,
				  signal.lift(function(f) { return f(2); }).apply(sDouble),
				  [4],
				  "lift(f => f(x)).apply(s) <=> s.apply(lift(x))");
});

tape("Other functions", function(t) {
	t.plan(3);

	shouldProduce(t,
				  countTo(3, 0).fold(function(a, b) { return a + b; }, 0),
				  [0,1,3,6],
				  "fold");

	shouldProduce(t,
				  signal.combine(countTo(1, 300), countTo(2, 0)),
				  [[0, 0], [0, 1], [0, 2], [1, 2]],
				  "combine");

	shouldProduce(t,
				  signal.flift(function(a, b) { return a + b*3; })(countTo(2, 0), countTo(2, 300)),
				  [0, 1, 2, 5, 8],
				  "flift");
});
