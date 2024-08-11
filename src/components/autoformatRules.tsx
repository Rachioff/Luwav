import { AutoformatRule } from '@udecode/plate-autoformat';
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_CODE,
  MARK_STRIKETHROUGH,
} from '@udecode/plate-basic-marks';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { ELEMENT_UL, ELEMENT_OL, ELEMENT_LI } from '@udecode/plate-list';

export const autoformatRules: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_H1,
    match: '# ',
  },
  {
    mode: 'block',
    type: ELEMENT_H2,
    match: '## ',
  },
  {
    mode: 'block',
    type: ELEMENT_H3,
    match: '### ',
  },
  {
    mode: 'block',
    type: ELEMENT_H4,
    match: '#### ',
  },
  {
    mode: 'block',
    type: ELEMENT_H5,
    match: '##### ',
  },
  {
    mode: 'block',
    type: ELEMENT_H6,
    match: '###### ',
  },
  {
    mode: 'mark',
    type: MARK_BOLD,
    match: '**',
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '*',
  },
  {
    mode: 'mark',
    type: MARK_CODE,
    match: '`',
  },
  {
    mode: 'mark',
    type: MARK_STRIKETHROUGH,
    match: '~~',
  },
  {
    mode: 'block',
    type: ELEMENT_UL,
    match: ['* ', '- '],
  },
  {
    mode: 'block',
    type: ELEMENT_OL,
    match: ['1. ', '1) '],
  },
];