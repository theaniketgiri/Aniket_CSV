
'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { parse } from 'papaparse'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setMessage('Please select a file')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      let parsedData
      try {
        if (file.name.endsWith('.csv')) {
          parsedData = parse(e.target?.result as string, { header: true }).data
        } else if (file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' })
          parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
        } else {
          setMessage('Unsupported file type')
          return
        }

        console.log('Parsed data:', parsedData) // Log parsed data

        const response = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: parsedData }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`)
        }

        const result = await response.json()
        setMessage(`${result.message} Imported ${result.count} records.`)
      } catch (error) {
        setMessage(`Error importing data: ${(error as Error).message}`)
        console.error('Import error:', error)
      }
    }

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else if (file.name.endsWith('.xlsx')) {
      reader.readAsBinaryString(file)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Dynamic CSV/Excel Import</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Choose Excel or CSV file
            </label>
            <input
              type="file"
              id="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Import Data
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
        )}
      </div>
    </main>
  )
}