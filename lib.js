/*
type Signal<T> = {
	fmap: <U> (T => U) => Signal<U>,
	bind: <U> (T => Signal<U>) => Signal<U>,
	listen: (T => void) => void
};
signal :: <T> ((T => void) => void) => Signal<T>;
signal.lift :: <U> U => Signal<U>
*/

function signal(resolver) {
	var cache = [];
	var targets = [];
	resolver(function(x) {
		cache.push(x);
		targets.forEach(function(f) {
			f(x);
		});
	});

	var self = {
		fmap: function(f) {
			return signal(function(resolve) {
				self.listen(function(x) {
					resolve(f(x));
				});
			});
		},
		bind: function(f) {
			return signal(function(resolve) {
				self.listen(function(x) {
					f(x).listen(function(y) {
						resolve(y);
					});
				});
			});
		},
		fold: function(f, i) {
			var acc = i;
			return self.fmap(function(x) {
				acc = f(acc, x);
				return acc;
			});
		},
		listen: function(f) {
			targets.push(f);
			cache.forEach(function(x) {
				f(x);
			});
		}
	};
	return self;
}

signal.lift = function(x) {
	return signal(function(resolve) { resolve(x); });
};

module.exports = signal;
