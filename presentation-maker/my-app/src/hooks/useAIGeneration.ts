import { useState, useCallback, useRef } from "react"
import { showNotification } from "../views/SpeakerNotesModalWindow/utils/notification"

export const useAIGeneration = () => {
    const [aiQuery, setAiQuery] = useState<string>("")
    const [aiResponse, setAiResponse] = useState<string>("")
    const [isGenerating, setIsGenerating] = useState(false)

    const abortControllerRef = useRef<AbortController | null>(null)

    const handleGenerateAIResponse = useCallback(async (query?: string) => {
        const queryToSend = query || aiQuery

        if (!queryToSend.trim()) {
            showNotification("Запрос пустой. Введите или проговорите запрос для AI")
            return
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const controller = new AbortController()
        abortControllerRef.current = controller

        setIsGenerating(true)
        setAiResponse("")

        try {
            const response = await fetch('/api/ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "local-model",
                    messages: [
                        {
                            role: "system",
                            content: "Ты - помощник для ответов во время презентации. Отвечай кратко, но ёмко и полно. Отвечай на русском языке.\n"
                        },
                        {
                            role: "user",
                            content: `Запрос по презентации: ${queryToSend}\n`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                    stream: true
                }),
                signal: controller.signal
            })

            const reader = response.body?.getReader()
            const decoder = new TextDecoder('utf-8')

            if (!reader) {
                return
            }

            try {
                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        break
                    }

                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n').filter(line => line.trim() !== '')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)

                            if (data === '[DONE]') {
                                break
                            }

                            const parsed = JSON.parse(data)
                            const content = parsed.choices[0]?.delta?.content || ''

                            if (content) {
                                setAiResponse(prev => prev + content)
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock()
            }
        } finally {
            setIsGenerating(false)
            abortControllerRef.current = null
        }
    }, [aiQuery])

    const addTextToAiQuery = useCallback((text: string, textAreaRef?: React.RefObject<HTMLTextAreaElement>) => {
        if (!text.trim()) {
            return null
        }

        const newText = text.trim()

        setAiQuery(prev => {
            const updatedText = prev.trim() ? prev + "\n\n" + newText : newText
            return updatedText
        })

        setTimeout(() => {
            textAreaRef?.current?.focus()
            if (textAreaRef?.current) {
                textAreaRef.current.selectionStart = textAreaRef.current.value.length
                textAreaRef.current.selectionEnd = textAreaRef.current.value.length
                textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
            }
        }, 100)

        return newText
    }, [])

    const handleStopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            setIsGenerating(false)
            showNotification("Генерация AI остановлена")
        }
    }, [])

    const handleClearAIResponse = useCallback(() => {
        setAiResponse("")
        showNotification("Ответ AI очищен")
    }, [])

    const handleClearAiQuery = useCallback(() => {
        setAiQuery("")
        showNotification("Запрос AI очищен")
    }, [])

    const handleCopyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(aiResponse)
            showNotification("Ответ AI скопирован в буфер обмена")
        } catch {
            showNotification("Ошибка при копировании ответа AI")
        }
    }, [aiResponse])

    const handleCopyAiQuery = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(aiQuery)
            showNotification("Запрос AI скопирован в буфер обмена")
        } catch  {
            showNotification("Ошибка при копировании запроса AI")
        }
    }, [aiQuery])

    return {
        aiQuery,
        aiResponse,
        isGenerating,
        setAiQuery,
        setAiResponse,
        handleGenerateAIResponse,
        addTextToAiQuery,
        handleStopGeneration,
        handleClearAIResponse,
        handleClearAiQuery,
        handleCopyToClipboard,
        handleCopyAiQuery
    }
}