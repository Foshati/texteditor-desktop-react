import { useEffect, useState, useContext, useRef } from "react";
import EditorContext from "./EditorContext";
import { invoke } from "@tauri-apps/api/tauri";
import * as monaco from 'monaco-editor';

export default function MonacoCodeEditor() {
  const { openFiles, currentFile, setOpenFiles } = useContext(EditorContext);
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const newEditor = monaco.editor.create(editorRef.current, {
      value: openFiles[currentFile]?.content || '',
      language: 'javascript', // یا هر زبان دیگری که مناسب است
      theme: 'vs-dark', // یا هر تم دیگری که ترجیح می‌دهید
      automaticLayout: true,
      minimap: { enabled: false },
    });

    setEditor(newEditor);

    return () => newEditor.dispose();
  }, []);

  useEffect(() => {
    if (editor) {
      editor.setValue(openFiles[currentFile]?.content || '');
    }
  }, [editor, openFiles, currentFile]);

  useEffect(() => {
    async function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        let file = openFiles[currentFile];
        if (file) {
          const content = editor.getValue();
          await invoke("write_to_file", {
            path: file.path,
            content: content,
          });
          let newOpenFiles = [...openFiles];
          newOpenFiles[currentFile].content = content;
          setOpenFiles(newOpenFiles);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openFiles, currentFile, editor, setOpenFiles]);

  useEffect(() => {
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, getLanguageForFile(openFiles[currentFile]?.name));
      }
    }
  }, [editor, openFiles, currentFile]);

  function getLanguageForFile(filename) {
    if (!filename) return 'plaintext';
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      // اضافه کردن زبان‌های دیگر در صورت نیاز
      default: return 'plaintext';
    }
  }

  if (openFiles[currentFile]?.isBinary === true) {
    return (
      <h1 className="text-center w-full h-full flex align-middle items-center justify-center">
        The file is not displayed in the text editor because it is either binary
        or uses an unsupported text encoding
      </h1>
    );
  }

  return (
    <div className="w-full h-full" ref={editorRef}></div>
  );
}