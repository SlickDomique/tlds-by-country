<template>
  <div>
    <div v-if="state.loading" class="loading">
      <svg
        aria-hidden="true"
        class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="sr-only"> Loading data...</span>
    </div>
    <table
      class="table-fixed w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      v-else
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 font-bold"
      >
        <tr>
          <th v-for="(col, columnName) in state.columns" :key="columnName" class="relative">
            <div
              v-if="state.columnValues[columnName]"
              class="px-6 py-4 cursor-pointer"
              @click.stop="toggleFilter(columnName)"
            >
              {{ columnName }}
            </div>
            <div v-else class="px-6 py-4">{{ columnName }}</div>
            <div
              v-if="state.activeFilter === columnName"
              class="right-0 absolute z-10 inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs dark:bg-gray-700 max-h-250 min-w-96 overflow-y-scroll overflow-x-hidden top-14 margin-auto"
            >
              <div class="mb-3">
                <button
                  @click="clearFilter(columnName)"
                  class="cursor-pointer inline-block py-2.5 px-5 mb-1 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 mr-3"
                >
                  Clear
                </button>
                <button
                  @click="closeFilter"
                  class="cursor-pointer inline-block py-2.5 px-5 mb-1 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <label class="block text-sm font-medium text-gray-900 dark:text-white"
                  >Search
                  <input
                    type="text"
                    v-model="state.searchFilter"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Search by..."
                  />
                </label>
              </div>
              <div class="mt-3">
                <div v-for="value in searchedFilterValues" :key="value" class="p-1">
                  <label class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    <input
                      type="checkbox"
                      :value="value"
                      v-model="state.filters[columnName]"
                      :class="`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${state.searchFilter && !searchedFilterValues.includes(value) ? 'hidden' : ''}`"
                    />
                    {{ value }}
                  </label>
                </div>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in filteredData"
          :key="index"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 even:dark:bg-gray-900 even:bg-gray-200"
        >
          <td v-for="(col, columnName) in state.columns" :key="columnName" class="px-6 py-4">
            {{ item[columnName] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'

const state = reactive({
  data: [],
  loading: true,
  filters: {},
  columns: {},
  columnValues: {},
  activeFilter: null,
  searchFilter: '',
})

onMounted(async () => {
  try {
    const response = await fetch('/domains.json')
    const data = await response.json()

    state.data = data

    if (state.data.length > 0) {
      state.columns = Object.keys(state.data[0]).reduce((acc, key) => {
        if (key === 'link') return acc
        acc[key] = true
        if (['country', 'organisation', 'whoisOrg'].includes(key)) {
          state.filters[key] = []

          state.columnValues[key] = [...new Set(state.data.map((item) => String(item[key])))].sort()
        }
        return acc
      }, {})
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    state.loading = false
  }
})

const searchedFilterValues = computed(() => {
  if (state.searchFilter === '') return state.columnValues[state.activeFilter]
  return state.columnValues[state.activeFilter].filter((value) => {
    return value.toLowerCase().includes(state.searchFilter.toLowerCase())
  })
})

const filteredData = computed(() => {
  return state.data.filter((item) => {
    return Object.entries(state.filters).every(([column, selectedValues]) => {
      if (selectedValues.length === 0) return true
      return selectedValues.includes(String(item[column]))
    })
  })
})

const toggleFilter = (columnName) => {
  state.searchFilter = ''
  state.activeFilter = state.activeFilter === columnName ? null : columnName
}

const closeFilter = () => {
  state.activeFilter = null
}

const clearFilter = (columnName) => {
  state.filters[columnName] = []
}
</script>
