// ============================================================
// source: https://usehooks-ts.com/react-hook/use-window-size
// ============================================================

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Window Event based useEventListener interface
function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element?: undefined,
    options?: boolean | AddEventListenerOptions,
): void

// Element Event based useEventListener interface
function useEventListener<
    K extends keyof HTMLElementEventMap,
    T extends HTMLElement = HTMLDivElement,
    >(
        eventName: K,
        handler: (event: HTMLElementEventMap[K]) => void,
        element: RefObject<T>,
        options?: boolean | AddEventListenerOptions,
): void

// Document Event based useEventListener interface
function useEventListener<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (event: DocumentEventMap[K]) => void,
    element: RefObject<Document>,
    options?: boolean | AddEventListenerOptions,
): void

function useEventListener<
    KW extends keyof WindowEventMap,
    KH extends keyof HTMLElementEventMap,
    T extends HTMLElement | void = void,
    >(
        eventName: KW | KH,
        handler: (
            event: WindowEventMap[KW] | HTMLElementEventMap[KH] | Event,
        ) => void,
        element?: RefObject<T>,
        options?: boolean | AddEventListenerOptions,
) {
    // Create a ref that stores handler
    const savedHandler = useRef(handler)

    useIsomorphicLayoutEffect(() => {
        savedHandler.current = handler
    }, [handler])

    useEffect(() => {
        // Define the listening target
        const targetElement: T | Window = element?.current || window
        if (!(targetElement && targetElement.addEventListener)) {
            return
        }

        // Create event listener that calls handler function stored in ref
        const eventListener: typeof handler = event => savedHandler.current(event)

        targetElement.addEventListener(eventName, eventListener, options)

        // Remove event listener on cleanup
        return () => {
            targetElement.removeEventListener(eventName, eventListener)
        }
    }, [eventName, element, options])
}

interface WindowSize {
    width: number
    height: number
}

function useWindowSize(): WindowSize {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: 0,
        height: 0,
    })

    const handleSize = () => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }

    useEventListener('resize', handleSize)

    // Set size at the first client-side load
    useIsomorphicLayoutEffect(() => {
        handleSize()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return windowSize
}

export default useWindowSize



