// app/lib/ckeditor.ts
import {
  ClassicEditor as ClassicEditorBase,
  Essentials,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  BlockQuote,
  Link,
  List,
  Heading,
  Font,
  Paragraph,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  Table,
  TableToolbar,
  MediaEmbed,
  PasteFromOffice,
  Autoformat,
  Indent,
  CloudServices,
  // Tambahkan plugin sesuai kebutuhanmu
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

export class ClassicEditor extends ClassicEditorBase {
  static builtinPlugins = [
    Essentials,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Subscript,
    Superscript,
    BlockQuote,
    Link,
    List,
    Heading,
    Font,
    Paragraph,
    Image,
    ImageUpload,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    Table,
    TableToolbar,
    MediaEmbed,
    PasteFromOffice,
    Autoformat,
    Indent,
    // CloudServices,
    // Sesuaikan dengan kebutuhan UI-mu
  ];

  static defaultConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'link',
      '|',
      'bulletedList',
      'numberedList',
      'indent',
      'outdent',
      '|',
      'imageUpload',
      'blockQuote',
      'insertTable',
      'mediaEmbed',
      '|',
      'undo',
      'redo',
    ],
    image: {
      toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
    // Tambahkan konfigurasi lain sesuai kebutuhan
  };
}