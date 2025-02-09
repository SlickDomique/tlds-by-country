<script setup>
import TldsTable from './components/TldsTable.vue'
</script>

<template>
  <main>
    <div class="w-200 m-auto p-5">
      <h1>TLDs with info about country</h1>
      <p>
        Here you can find a list of all TLDs and their corresponding countries and organisations.
      </p>
      <p>Click on a column header to filter the data by that column.</p>
      <p>
        Source, data and scrapper available on
        <a
          href="https://github.com/SlickDomique/tlds-by-country"
          target="_blank"
          class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >Github</a
        >
      </p>
    </div>
    <TldsTable />
  </main>
</template>
