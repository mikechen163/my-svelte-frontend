<!-- src/lib/components/ui/select/select.svelte -->  
<script lang="ts">  
  import { Select as SelectPrimitive } from "bits-ui";  
  import { getContext, setContext } from "svelte";  

  type $Props = SelectPrimitive.Props;  

  export let value: $Props["value"] = undefined;  
  export let defaultValue: $Props["defaultValue"] = undefined;  
  export let onValueChange: $Props["onValueChange"] = undefined;  
  export let open: $Props["open"] = undefined;  
  export let defaultOpen: $Props["defaultOpen"] = undefined;  
  export let onOpenChange: $Props["onOpenChange"] = undefined;  
  export let dir: $Props["dir"] = undefined;  
  export let name: $Props["name"] = undefined;  
  export let disabled: $Props["disabled"] = undefined;  
  export let required: $Props["required"] = undefined;  

  setContext("select", {  
    selectedValue: value,  
    onValueChange  
  });  
</script>  

<SelectPrimitive.Root  
  {value}  
  {defaultValue}  
  {onValueChange}  
  {open}  
  {defaultOpen}  
  {onOpenChange}  
  {dir}  
  {name}  
  {disabled}  
  {required}  
  {...$restProps}  
>  
  <slot />  
</SelectPrimitive.Root>  
