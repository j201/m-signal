/*
type Signal<T> = {
	fmap: <U> (T => U) => Signal<U>,
	bind: <U> (T => Signal<U>) => Signal<U>,
	fold: <U> ((U, T) => U, U) => Signal<U>,
	apply: <U => V = T> Signal<U> => Signal<V>,
	listen: (T => void) => void
};
signal :: <T> ((T => void) => void) => Signal<T>;
signal.unit :: <U> U => Signal<U>
signal.combine :: <T, U,...> [Signal<T>, Signal<U>,...] => Signal<[T, U,...]>
signal.lift :: <T, U,...,R> ((T, U,...) => R) => ((Signal<T>, Signal<U>,...) => Signal<R>)
*/

function signal(source) {
	var targets = [];
	var hasValue = false;
	var value;

	source(function(x) {
		hasValue = true;
		value = x;
		targets.forEach(function(f) {
			f(x);
		});
	});

	var self = {
		fmap: function(f) {
			return signal(function(broadcast) {
				self.listen(function(x) {
					broadcast(f(x));
				});
			});
		},
		bind: function(f) {
			return signal(function(broadcast) {
				self.listen(function(x) {
					f(x).listen(function(y) {
						broadcast(y);
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
		apply: function(s) { // IIRC, implementing apply using bind is inefficient for signals
			return signal(function(broadcast) {
				var sVal;
				s.listen(function(x) {
					sVal = x;
					if (hasValue)
						broadcast(value(sVal));
				});
				self.listen(function(f) {
					broadcast(f(sVal));
				});
			});
		},
		listen: function(f) {
			targets.push(f);
			if (hasValue)
				f(value);
		}
	};
	return self;
}

signal.unit = function(x) {
	return signal(function(broadcast) { broadcast(x); });
};

signal.combine = function(/*...ss*/) {
	return Array.prototype.reduce.call(arguments, function(acc, s) {
		return acc.fmap(function(xs) {
			return function(y) {
				return xs.concat([y]);
			};
		}).apply(s);
	}, signal.unit([]));
};

signal.lift = function(f) {
	return function(/*...ss*/) {
		return signal.combine.apply(null, arguments)
			.fmap(function (xs) {
				 return f.apply(null, xs);
			});
	};
};

module.exports = signal;
