import * as React from 'react'

import copyToClipboard from 'clipboard-copy'
import mermaid from 'mermaid'
import { CodeBlock } from 'notion-types'
import { getBlockTitle } from 'notion-utils'
import { highlightElement } from 'prismjs'
import 'prismjs/components/prism-clike.min.js'
import 'prismjs/components/prism-css-extras.min.js'
import 'prismjs/components/prism-css.min.js'
import 'prismjs/components/prism-javascript.min.js'
import 'prismjs/components/prism-js-extras.min.js'
import 'prismjs/components/prism-json.min.js'
import 'prismjs/components/prism-jsx.min.js'
import 'prismjs/components/prism-tsx.min.js'
import 'prismjs/components/prism-typescript.min.js'

import { Text } from '../components/text'
import { useNotionContext } from '../context'
import CopyIcon from '../icons/copy'
import { cs } from '../utils'

export const Code: React.FC<{
  block: CodeBlock
  defaultLanguage?: string
  className?: string
}> = ({ block, defaultLanguage = 'typescript', className }) => {
  const [isCopied, setIsCopied] = React.useState(false)
  const copyTimeout = React.useRef<number>()
  const { recordMap } = useNotionContext()
  const content = getBlockTitle(block, recordMap)
  const language = (
    block.properties?.language?.[0]?.[0] || defaultLanguage
  ).toLowerCase()
  const caption = block.properties.caption

  const codeRef = React.useRef()
  React.useEffect(() => {
    if (codeRef.current) {
      try {
        highlightElement(codeRef.current)
      } catch (err) {
        console.warn('prismjs highlight error', err)
      }
    }
  }, [codeRef])

  const onClickCopyToClipboard = React.useCallback(() => {
    copyToClipboard(content)
    setIsCopied(true)

    if (copyTimeout.current) {
      clearTimeout(copyTimeout.current)
      copyTimeout.current = null
    }

    copyTimeout.current = setTimeout(() => {
      setIsCopied(false)
    }, 1200) as unknown as number
  }, [content, copyTimeout])

  const copyButton = (
    <div className='notion-code-copy-button' onClick={onClickCopyToClipboard}>
      <CopyIcon />
    </div>
  )

  if (language === 'mermaid') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      themeCSS: `
          g.classGroup rect {
            fill: #282a36;
            stroke: #6272a4;
          }
          g.classGroup text {
            fill: #f8f8f2;
          }
          g.classGroup line {
            stroke: #f8f8f2;
            stroke-width: 0.5;
          }
          .classLabel .box {
            stroke: #21222c;
            stroke-width: 3;
            fill: #21222c;
            opacity: 1;
          }
          .classLabel .label {
            fill: #f1fa8c;
          }
          .relation {
            stroke: #ff79c6;
            stroke-width: 1;
          }
          #compositionStart, #compositionEnd {
            fill: #bd93f9;
            stroke: #bd93f9;
            stroke-width: 1;
          }
          #aggregationEnd, #aggregationStart {
            fill: #21222c;
            stroke: #50fa7b;
            stroke-width: 1;
          }
          #dependencyStart, #dependencyEnd {
            fill: #00bcd4;
            stroke: #00bcd4;
            stroke-width: 1;
          }
          #extensionStart, #extensionEnd {
            fill: #f8f8f2;
            stroke: #f8f8f2;
            stroke-width: 1;
          }`,
      fontFamily: 'Fira Code'
    })
    return <div className='mermaid'>{content}</div>
  } else {
    return (
      <>
        <pre className={cs('notion-code', className)}>
          <div className='notion-code-copy'>
            {copyButton}

            {isCopied && (
              <div className='notion-code-copy-tooltip'>
                <div>{isCopied ? 'Copied' : 'Copy'}</div>
              </div>
            )}
          </div>

          <code className={`language-${language}`} ref={codeRef}>
            {content}
          </code>
        </pre>

        {caption && (
          <figcaption className='notion-asset-caption'>
            <Text value={caption} block={block} />
          </figcaption>
        )}
      </>
    )
  }
}
