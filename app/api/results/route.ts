import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("eid-salami") // Using the database name from the connection string

    const results = await db.collection("results").find({}).sort({ timestamp: -1 }).toArray()

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, prize } = await request.json()

    if (!name || !prize) {
      return NextResponse.json({ error: "Name and prize are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("eid-salami") // Using the database name from the connection string

    const result = await db.collection("results").insertOne({
      name,
      prize,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 })
  }
}
