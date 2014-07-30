// Just some quick demos I made when developing. Need to be turned into real tests

// Example usage:
var counterSignal = time => signal(function loop(resolve, n = 0) {
	resolve(n);
	setTimeout(() => loop(resolve, n + 1), time);
});

var countTo = (x, time) => signal(function loop(resolve, n = 0) {
	resolve(n);
	if (n < x) 
		setTimeout(() => loop(resolve, n + 1), time);
});

counterSignal(1000).bind(x => countTo(x, 100)).listen(console.log.bind(console));

// Monad laws:
// Should log 0 to 10
signal.lift(10).bind(x => countTo(x, 100)).listen(console.log.bind(console));

// Should log 0 to 10
countTo(10, 100).bind(signal.lift).listen(console.log.bind(console));

var double = x => signal.lift(x*2);
var inc = x => signal.lift(x+1);
// Should log the same
countTo(2, 100).bind(double).bind(inc).listen(console.log.bind(console));
countTo(2, 100).bind(x => double(x).bind(inc)).listen(console.log.bind(console));

// Functor laws:
// Should log 0 to 10
countTo(10, 100).fmap(x => x).listen(console.log.bind(console));

// Should log 1,3,5
countTo(2, 100).fmap(x => x*2).fmap(x => x+1).listen(console.log.bind(console));

