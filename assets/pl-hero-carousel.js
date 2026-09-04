(function(){
  var stage = document.querySelector('.pl-hero__stage');
  if(!stage) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slides = [].slice.call(stage.querySelectorAll('.pl-hero__slide'));
  var dots = [].slice.call(document.querySelectorAll('.pl-hero__dots button'));
  if(slides.length <= 1) return;
  var i = 0, timer = null;
  function go(n){
    i = (n + slides.length) % slides.length;
    slides.forEach(function(s, idx){ s.classList.toggle('is-on', idx === i); });
    dots.forEach(function(d, idx){ d.classList.toggle('is-on', idx === i); });
  }
  function play(){ if (timer || reduce) return; timer = setInterval(function(){ go(i+1); }, 3800); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }
  dots.forEach(function(d, idx){
    d.addEventListener('click', function(){ stop(); go(idx); play(); });
    d.addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight'){ stop(); go(i+1); play(); }
      else if(e.key === 'ArrowLeft'){ stop(); go(i-1); play(); }
    });
  });
  stage.addEventListener('mouseenter', stop);
  stage.addEventListener('mouseleave', play);
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ e.isIntersecting ? play() : stop(); });
    }, { threshold:0.2 }).observe(stage);
  } else {
    play();
  }
})();
