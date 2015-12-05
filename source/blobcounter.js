var cli = require('cli');
var fs = require('fs'), PNG = require('pngjs').PNG;

fs
		.createReadStream(cli.args[0])
		.pipe(new PNG({
			filterType : 4
		}))
		.on(
				'parsed',
				function() {

					var height = this.height;
					var width = this.width;
					var particles = [];
					var radius = 1;

					// Running through all of the pixels
					for (var y = 0; y < height; y++) {
						for (var x = 0; x < width; x++) {

							// Because every pixels has four value ( r,g,b,a )
							var idx = (width * y + x) << 2;

							// Using number of pixel instead of x and y to make
							// the job easier
							var idp = (width * y + x);

							// Check if red value is 0 . We want black dots but
							// we don't need to check all four of them because
							// we trust the input
							if (this.data[idx] == 0) {
								var particles_neighbor = [];

								// Now we run through all of known blobs to
								// search if any of them has a neighbor member
								// of our current pixel
								for (var i = 0; i < particles.length; i++) {

									// TODO : make the radius area into a circle
									// instead of a square
									var y_start = y - radius;
									var y_end = y + 1;

									var x_start = x - radius;
									var x_end = x + radius + 1;

									// Now we check every neighbor pixel to
									// check if any of them is member of any
									// blob
									neighborhoodwatch: for (var y2 = y_start; y2 < y_end; y2++) {

										for (var x2 = x_start; x2 < x_end; x2++) {
											var idx = (width * y2 + x2);

											var res1 = particles[i]
													.indexOf(idx);
											if (res1 != -1) {
												particles_neighbor.push(i);

												// If we find a neighbor we
												// break the neighborhoodwatch
												// label in order to save
												// resources
												break neighborhoodwatch;
											}

										}
									}

								}

								// If we didn't find any neighbor particle we
								// define a new blob
								if (particles_neighbor.length == 0) {
									particles.push([ idp ]);

									// If there was a neighbor blob we add the
									// pixel to it
								} else if (particles_neighbor.length == 1) {

									particles[particles_neighbor[0]].push(idp);

									// If there were more than one neighbor blob
									// we merge all of them then add the pixel
									// to it
								} else if (particles_neighbor.length > 1) {

									for (var pi = 1; pi < particles_neighbor.length; pi++) {

										// Merge to the first neighbot we saw
										Array.prototype.push
												.apply(
														particles[particles_neighbor[0]],
														particles[particles_neighbor[pi]]);

										// Remove the extra
										particles.splice(
												particles_neighbor[pi], 1);
									}

									// Add pixel to the final blob
									particles[particles_neighbor[0]].push(idp);

								}

							}

						}
					}

					var blobs = [];

					// Running through particles we found so we can make a nice
					// result
					for (var b = 0; b < particles.length; b++) {
						var particlex = 0;
						var particley = 0;

						// Calculating center of gravity based on average Xs and
						// Ys
						for (var p = 0; p < particles[b].length; p++) {

							var y = Math.floor(particles[b][p] / width);
							var x = particles[b][p] - (y * width);

							particlex += x;
							particley += y;
						}

						var particleavgx = Math.round(particlex
								/ particles[b].length);
						var particleavgy = Math.round(particley
								/ particles[b].length);

						// Pushing center of gravity and mess ( number of pixels
						// ) into an array
						blobs.push({
							cog : {
								x : particleavgx,
								y : particleavgy
							},
							mess : particles[b].length
						});

					}

					console.log(blobs);

				});