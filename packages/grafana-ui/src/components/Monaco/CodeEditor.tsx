import React from 'react';
import { withTheme } from '../../themes';
import { Themeable } from '../../types';
import { Monaco, MonacoEditor as MonacoEditorType, CodeEditorProps, MonacoOptions } from './types';
import { registerSuggestions } from './suggestions';
import MonacoEditor, { loader as monacoEditorLoader } from '@monaco-editor/react';

import type * as monacoType from 'monaco-editor/esm/vs/editor/editor.api';
declare let __webpack_public_path__: string;

type Props = CodeEditorProps & Themeable;

let initalized = false;
function initMonoco() {
  if (initalized) {
    return;
  }

  let root = '/public/lib/';
  if (__webpack_public_path__) {
    const publicpath = // __webpack_public_path__ includes the 'build/' suffix
      __webpack_public_path__.substring(0, __webpack_public_path__.lastIndexOf('build/')) || __webpack_public_path__;
    root = publicpath + 'lib/';
  }

  monacoEditorLoader.config({
    paths: {
      vs: root + 'monaco/min/vs',
    },
  });
  initalized = true;
}

class UnthemedCodeEditor extends React.PureComponent<Props> {
  completionCancel?: monacoType.IDisposable;
  monaco?: Monaco;

  constructor(props: Props) {
    super(props);
    initMonoco();
  }

  componentWillUnmount() {
    if (this.completionCancel) {
      this.completionCancel.dispose();
    }
  }

  componentDidUpdate(oldProps: Props) {
    const { getSuggestions, language } = this.props;

    if (language !== oldProps.language && getSuggestions) {
      if (this.completionCancel) {
        this.completionCancel.dispose();
      }

      if (!this.monaco) {
        throw new Error('Monaco instance not loaded yet');
      }

      this.completionCancel = registerSuggestions(this.monaco, language, getSuggestions);
    }
  }

  // This is replaced with a real function when the actual editor mounts
  getEditorValue = () => '';

  onBlur = () => {
    const { onBlur } = this.props;
    if (onBlur) {
      onBlur(this.getEditorValue());
    }
  };

  handleBeforeMount = (monaco: Monaco) => {
    this.monaco = monaco;
    const { language, getSuggestions } = this.props;

    if (getSuggestions) {
      this.completionCancel = registerSuggestions(monaco, language, getSuggestions);
    }
  };

  handleOnMount = (editor: MonacoEditorType, monaco: Monaco) => {
    const { onSave, onEditorDidMount } = this.props;

    this.getEditorValue = () => editor.getValue();

    if (onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
        onSave(this.getEditorValue());
      });
    }

    if (onEditorDidMount) {
      onEditorDidMount(editor);
    }
  };

  render() {
    const { theme, language, width, height, showMiniMap, showLineNumbers, readOnly, monacoOptions } = this.props;
    const value = this.props.value ?? '';
    const longText = value.length > 100;

    const options: MonacoOptions = {
      wordWrap: 'off',

      // TODO: this true anymore?
      codeLens: false, // not included in the bundle

      minimap: {
        enabled: longText && showMiniMap,
        renderCharacters: false,
      },
      readOnly,
      lineNumbersMinChars: 4,
      lineDecorationsWidth: 0,
      overviewRulerBorder: false,
      automaticLayout: true,
    };

    if (!showLineNumbers) {
      options.glyphMargin = false;
      options.folding = false;
      options.lineNumbers = 'off';
      options.lineDecorationsWidth = 5; // left margin when not showing line numbers
      options.lineNumbersMinChars = 0;
    }

    return (
      <div onBlur={this.onBlur}>
        <MonacoEditor
          width={width}
          height={height}
          defaultLanguage={language}
          theme={theme.isDark ? 'vs-dark' : 'vs-light'}
          defaultValue={value}
          options={{
            ...options,
            ...(monacoOptions ?? {}),
          }}
          beforeMount={this.handleBeforeMount}
          onMount={this.handleOnMount}
        />
      </div>
    );
  }
}

export default withTheme(UnthemedCodeEditor);
