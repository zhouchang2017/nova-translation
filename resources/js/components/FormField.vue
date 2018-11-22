<template>
    <default-field :field="field" :fullWidthContent="field.rich">
        <template slot="field">
            <a
                    class="inline-block font-bold cursor-pointer mr-2 animate-text-color select-none"
                    :class="{ 'text-60': localeKey !== currentLocale, 'text-primary border-b-2': localeKey === currentLocale }"
                    :key="`a-${localeKey}`"
                    v-for="(locale, localeKey) in field.locales"
                    @click="changeTab(localeKey)"
            >
                {{ locale }}
            </a>

            <textarea
                    ref="field"
                    :id="field.name"
                    class="mt-4 w-full form-control form-input form-input-bordered py-3 min-h-textarea"
                    :class="errorClasses"
                    :placeholder="field.name"
                    v-model="value[currentLocale]"
                    v-if="!field.singleLine && !field.rich"
                    @keydown.tab="handleTab"
            ></textarea>

            <div v-if="!field.singleField && field.rich" class="mt-4">

                <quill-editor ref="field" name="quill-editor"
                              v-model="value[currentLocale]"
                              :options="editorOption"
                >
                </quill-editor>
            </div>

            <input
                    ref="field"
                    type="text"
                    :id="field.name"
                    class="mt-4 w-full form-control form-input form-input-bordered"
                    :class="errorClasses"
                    :placeholder="field.name"
                    v-model="value[currentLocale]"
                    v-if="field.singleLine"
                    @keydown.tab="handleTab"
            />

            <p v-if="hasError" class="my-2 text-danger">
                {{ firstError }}
            </p>
        </template>
    </default-field>
</template>

<script>


  import { FormField, HandlesValidationErrors } from 'laravel-nova'
  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'
  import { quillEditor } from 'vue-quill-editor'

  export default {
    mixins: [FormField, HandlesValidationErrors],

    props: ['resourceName', 'resourceId', 'field'],

    components: {
      quillEditor
    },

    data () {
      return {
        locales: Object.keys(this.field.locales),
        currentLocale: null,
        editorOption: {
          scrollingContainer: '#scrolling-container',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'font': [] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              ['clean'],
              ['link', 'image', 'video']
            ]
          }
        }
      }
    },

    mounted () {
      this.currentLocale = this.locales[0] || null

      Nova.$on(`'localeChanged-'${this.field.name}`, locale => {
        if (this.currentLocale !== locale) {
          this.changeTab(locale, true)
        }
      })
    },

    methods: {
      /*
       * Set the initial, internal value for the field.
       */
      setInitialValue () {
        this.value = this.field.value || {}
      },

      /**
       * Fill the given FormData object with the field's internal value.
       */
      fill (formData) {
        Object.keys(this.value).forEach(locale => {
          formData.append(this.field.attribute + '[' + locale + ']', this.value[locale] || '')
        })
      },

      /**
       * Update the field's internal value.
       */
      handleChange (value) {
        this.value[this.currentLocale] = value
      },

      changeTab (locale, dontEmit) {
        if (this.currentLocale !== locale) {
          if (!dontEmit) {
            Nova.$emit(`'localeChanged-'${this.field.name}`, locale)
          }

          this.currentLocale = locale

          this.$nextTick(() => {
            if (this.field.rich) {
              this.$refs.field.quill.focus()
            } else {
              this.$refs.field.focus()
            }
          })
        }
      },

      handleTab (e) {
        const currentIndex = this.locales.indexOf(this.currentLocale)
        if (!e.shiftKey) {
          if (currentIndex < this.locales.length - 1) {
            e.preventDefault()
            this.changeTab(this.locales[currentIndex + 1])
          }
        } else {
          if (currentIndex > 0) {
            e.preventDefault()
            this.changeTab(this.locales[currentIndex - 1])
          }
        }
      }
    }
  }
</script>
