/**
 * cursor.js — Cursor DNA animado para todas as páginas do GeneLab
 * Ícone de hélice de DNA que segue o mouse com efeito magnético em links.
 */

(function () {
    'use strict';

    const cursor    = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');

    if (!cursor) return; // segurança: sai se o elemento não existir

    let mouseX = -100, mouseY = -100;
    let blurX  = -100, blurY  = -100;
    let raf;

    /* ── Torna visível na primeira movimentação ── */
    let visible = false;
    function show() {
        if (!visible) {
            cursor.style.opacity    = '1';
            cursorBlur.style.opacity = '1';
            visible = true;
        }
    }

    /* ── Atualiza posição do cursor principal instantaneamente ── */
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top  = mouseY + 'px';
        show();
    });

    /* ── Anel externo segue com lag suave via RAF ── */
    function animateBlur() {
        blurX += (mouseX - blurX) * 0.12;
        blurY += (mouseY - blurY) * 0.12;
        cursorBlur.style.left = blurX + 'px';
        cursorBlur.style.top  = blurY + 'px';
        raf = requestAnimationFrame(animateBlur);
    }
    animateBlur();

    /* ── Efeito magnético ao passar em links / botões ── */
    const interactables = 'a, button, [class*="btn"], .magnetic, label';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactables)) {
            document.body.classList.add('hovering-link');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactables)) {
            document.body.classList.remove('hovering-link');
        }
    });

    /* ── Esconde ao sair da janela ── */
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity    = '0';
        cursorBlur.style.opacity = '0';
        visible = false;
    });

    document.addEventListener('mouseenter', () => {
        show();
    });

    /* ── Garante que o cursor nativo está escondido ── */
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

})();
