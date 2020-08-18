const Web3 = require('web3')
const Network = require('@maticnetwork/meta/network')
const fs = require('fs')
const { getReceiptProof, getReceiptBytes } = require('./proofs')
const { rlp, keccak256, toBuffer, bufferToHex } = require('ethereumjs-util')


const web3 = new Web3('https://rpc-mumbai.matic.today')


const getTxs = async() => {
  // const block = JSON.parse(fs.readFileSync('block.json'))
  // const receiptList = JSON.parse(fs.readFileSync('receipt-list.json'))

  // const block = await web3.eth.getBlock(3113941, true) // block having 1 tx
  const block = await web3.eth.getBlock(3113749, true) // block having 2 tx
  const receiptList = await Promise.all(
    block.transactions.map(async (tx, i) => {
      const receipt = await web3.eth.getTransactionReceipt(tx.hash)
      console.log('fetched', i)
      return receipt
    })
  )

  // fs.writeFileSync('block.json', JSON.stringify(block) + '\n')
  // fs.writeFileSync('receipt-list.json', JSON.stringify(receiptList) + '\n')

  await Promise.all(
    receiptList.map(async(receipt) => {
      const receiptProof = await getReceiptProof(receipt, block, null /* web3 */, receiptList)
      // console.log('receipt', bufferToHex(getReceiptBytes(receipt)))
      // console.log('branchMask', bufferToHex(rlp.encode(receiptProof.path)))
      // console.log('receiptProof', bufferToHex(rlp.encode(receiptProof.parentNodes)))
      // console.log('receiptRoot', bufferToHex(Buffer.from(block.receiptsRoot.slice(2), 'hex')))
      // console.log('path', receipt.transactionIndex, receiptProof.path, rlp.encode(receiptProof.path))

      const data = bufferToHex(
        rlp.encode([
          bufferToHex(Buffer.from(block.receiptsRoot.slice(2), 'hex')),
          bufferToHex(getReceiptBytes(receipt)),
          bufferToHex(rlp.encode(receiptProof.parentNodes)),
          bufferToHex(rlp.encode(receiptProof.path))
        ])
      )
      console.log('data', data)
      console.log('')
    })
  )
}

getTxs()
