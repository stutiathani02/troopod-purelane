(function(){
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.pl-card__add');
    if(!btn || btn.disabled) return;
    var id = btn.getAttribute('data-variant-id');
    if(!id) return;
    e.preventDefault();
    var original = btn.textContent;
    btn.disabled = true; btn.textContent = 'Adding…';
    fetch('/cart/add.js', {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({items:[{id: id, quantity: 1}]})
    }).then(function(r){ return r.json(); }).then(function(){
      btn.textContent = 'Added ✓';
      document.dispatchEvent(new CustomEvent('cart:refresh'));
      setTimeout(function(){ btn.textContent = original; btn.disabled = false; }, 1400);
    }).catch(function(){
      btn.textContent = 'Try again';
      setTimeout(function(){ btn.textContent = original; btn.disabled = false; }, 1400);
    });
  });
})();
