<script lang="ts">
  import type {
    ChangeEventHandler,
    ClassValue,
    FormEventHandler,
    FullAutoFill,
    HTMLInputAttributes,
  } from 'svelte/elements';
  import { getInputGroupContext } from '../InputGroup/context';

  export type TextInputProps = {
    /**
     * The value of the input
     */
    value: unknown;
    /**
     * The name attribute for the input
     */
    name: string;
    /**
     * The placeholder text for the input
     */
    placeholder?: string;
    /**
     * The HTML input type attribute
     * @default 'text'
     */
    type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';
    /**
     * CSS class to apply to the input component
     */
    class?: ClassValue;
    /**
     * Show an error state for the input
     * @default false
     */
    error?: boolean;
    /**
     * The visual style variant of the input
     * @default 'outlined'
     */
    variant?: 'contained' | 'outlined';
    /**
     * The size of the input
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Round the button corners
     * @default false
     */
    round?: boolean;
    /**
     * Event handler for input changes
     */
    onChange?: ChangeEventHandler<HTMLInputElement>;
    /**
     * Event handler for input changes (fire after every input)
     */
    onInput?: FormEventHandler<HTMLInputElement>;
    /**
     * Autocomplete attribute for the input
     * @default 'off'
     */
    autocomplete?: FullAutoFill;
  } & Omit<
    HTMLInputAttributes,
    'class' | 'onchange' | 'type' | 'autocomplete' | 'value' | 'placeholder' | 'name' | 'size'
  >;

  const {
    onChange,
    onInput,
    type = 'text',
    autocomplete = 'off',
    value,
    placeholder: propsPlaceholder,
    name,
    class: propsClassname,
    error = false,
    variant = 'outlined',
    size = 'md',
    round = false,
    id: propsId,
    ...inputAttributes
  }: TextInputProps = $props();

  const variantClassName = $derived.by(() => {
    switch (variant) {
      case 'contained':
        return [
          'dark:focus:bg-neutral-500/10 focus:bg-neutral-500/10 focus:outline-solid',
          error
            ? 'placeholder-error-500 dark:placeholder-error-700 bg-error-500/20 dark:bg-error-600/10 hover:bg-error-500/30 dark:hover:bg-error-600/20 outline-error-500 dark:outline-error-800'
            : 'bg-neutral-900/10 dark:bg-neutral-100/10 hover:bg-neutral-900/20 dark:hover:bg-neutral-100/20 outline-neutral-400 dark:outline-neutral-600',
        ];
      case 'outlined':
        return [
          'bg-white dark:bg-black border',
          error
            ? 'placeholder-error-400 dark:placeholder-error-800 border-error-400 dark:border-error-800 dark:hover:border-error-600 hover:border-error-600 focus:border-error-500 focus:dark:border-error-700'
            : 'border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-400 hover:border-neutral-600 focus:border-neutral-500',
        ];
    }
  });

  const othersClassName = $derived.by(() => {
    switch (size) {
      case 'sm':
        return ['text-sm  h-8', round ? 'rounded-full px-3' : 'rounded-sm px-2'];
      case 'md':
        return ['text-base  h-10', round ? 'rounded-full px-4' : 'rounded-md px-3'];
      case 'lg':
        return ['text-lg  h-12', round ? 'rounded-full px-5' : 'rounded-lg px-4'];
    }
  });

  const inputGroupContext = getInputGroupContext();

  const placeholder = $derived(propsPlaceholder ?? inputGroupContext?.label ?? '');

  const contextId = inputGroupContext?.getId();

  const id = $derived(propsId ?? contextId ?? '');
</script>

<input
  class={[
    'flex flex-none items-center transition-colors outline-none',
    variantClassName,
    othersClassName,
    propsClassname,
  ]}
  onchange={onChange}
  oninput={onInput}
  {type}
  {autocomplete}
  {value}
  {placeholder}
  {name}
  {id}
  {...inputAttributes}
/>
