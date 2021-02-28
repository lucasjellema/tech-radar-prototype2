export {cartesianFromPolar , polarFromCartesion}

  const cartesianFromPolar = function(polar) {
    return {
      x: polar.r * Math.cos(polar.phi),
      y: polar.r * Math.sin(polar.phi)
    }
  }

  const polarFromCartesion = function (cartesian) {
    const x = cartesian.x;
    const y = cartesian.y;
  
    return {
      t: Math.atan2(y, x),
      phi: Math.sqrt(x * x + y * y)
    }
  }