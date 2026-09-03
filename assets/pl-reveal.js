(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Header scrolled state
  var body = document.body, raf = null;
  function onScroll(){
    if (raf) return;
    raf = requestAnimationFrame(function(){
      body.classList.toggle('pl-scrolled', window.scrollY > 40);
      raf = null;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  var targets = document.querySelectorAll('.pl-reveal, .pl-section-wrap');
  if (reduce || !('IntersectionObserver' in window)){
    targets.forEach(function(el){ el.classList.add('pl-in','pl-in-instant'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        e.target.classList.add('pl-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin:'0px 0px -8% 0px', threshold:0.10 });
  targets.forEach(function(el){
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0){
      el.classList.add('pl-in','pl-in-instant');
    } else {
      io.observe(el);
    }
  });
})();
