/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        Tests for the editor's search keybindings
 * CVM-Role:        TESTING
 * Maintainers:     John Costa
 * License:         GNU GPL v3
 *
 * Description:     This file tests that F3 and Shift-F3 step through search
 *                  matches next to the customizable find next/previous keys.
 *
 * END HEADER
 */

import { mainEditorKeybindings } from 'source/common/modules/markdown-editor/keymaps/default'
import { strictEqual } from 'assert'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, runScopeHandlers } from '@codemirror/view'
import { search, SearchQuery, setSearchQuery } from '@codemirror/search'

describe('MarkdownEditor#mainEditorKeybindings() search', function () {
  before(function () {
    // The keymap builds its case transforms from the app locale.
    window.config.set('appLang', 'en-US')
    // EditorView schedules measuring through the JSDOM window, which the
    // shared setup only polyfills on the global object.
    window.requestAnimationFrame ??= global.requestAnimationFrame
    window.cancelAnimationFrame ??= global.cancelAnimationFrame
  })

  function makeView (): EditorView {
    const state = EditorState.create({
      doc: 'foo bar foo baz foo',
      extensions: [
        search(),
        keymap.of(mainEditorKeybindings([], { autocompleteWithEnter: true, autocompleteWithTab: true }))
      ]
    })
    const view = new EditorView({ state, parent: document.body })
    view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: 'foo' })) })
    return view
  }

  function press (view: EditorView, init: KeyboardEventInit): boolean {
    return runScopeHandlers(view, new KeyboardEvent('keydown', init), 'editor')
  }

  it('F3 moves to the next match and Shift-F3 back to the previous one', function () {
    const view = makeView()

    strictEqual(press(view, { key: 'F3' }), true)
    strictEqual(view.state.selection.main.from, 0)

    press(view, { key: 'F3' })
    strictEqual(view.state.selection.main.from, 8)

    strictEqual(press(view, { key: 'F3', shiftKey: true }), true)
    strictEqual(view.state.selection.main.from, 0)

    view.destroy()
  })
})
