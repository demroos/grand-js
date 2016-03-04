Grand-js library
============================

Основное назначение библиотеки, дать возможность создавать "модули", которые будут связываться с html даже после ajax загрузки вёрстки.

Папки
-------------------

      demo/          примеры использования
      src/           исходники

Подключение
-------------------

```html
<script type="text/javascript" src="/path/to/jquery.js"></script>
<script type="text/javascript" src="/path/to/grand.js"></script>
```

```javascript
app.createModule('collapse', 'module.base', [], {
    name: 'collapse',
    isOpen: false,
    _construct: function () {
        //дополнительная инициализация
        this.$cont = $('.collapse_cont', this.$el);
    },
    events: {
        'click .collapse_btn': 'onClick'
    },
    onClick: function (e) {
        e.preventDefault();
        if (this.isOpen) {
            this.$cont.hide();
        } else {
            this.$cont.show();
        }
        this.isOpen = !this.isOpen;
    }
});
```

```html
<div class="js" data-module="collapse">
    <a href="#" class="collapse_btn">Collapse</a>

    <div class="collapse_cont" style="display: none">
        Collapsed
    </div>
</div>
```