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
      phi: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y)
    }
  }