<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\RentalRequest;
use App\Models\Post;
use App\Models\Contract;
use App\Models\Notification;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Create payment for approved booking request
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'rental_request_id' => 'required|integer|exists:rental_requests,id',
            'payment_method' => 'required|string|in:jeeb_wallet,kareemi_bank,kak_bank,one_cash,yemen_kuwait_bank',
        ]);

        $rentalRequest = RentalRequest::with('post')->findOrFail($request->rental_request_id);

        // Check if user owns the request
        if ($rentalRequest->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if request is approved
        if ($rentalRequest->status !== 'approved') {
            return response()->json(['message' => 'Only approved booking requests can proceed to payment'], 400);
        }

        // Check if payment already exists and is paid
        $existingPayment = Payment::where('rental_request_id', $rentalRequest->id)
            ->where('status', 'paid')
            ->first();

        if ($existingPayment) {
            // Return the existing contract if payment is already completed
            $contract = Contract::where('payment_id', $existingPayment->id)->first();
            return response()->json([
                'message' => 'Payment already completed for this request',
                'payment' => $existingPayment,
                'contract' => $contract,
                'already_paid' => true,
            ], 200);
        }

        // Check if there's a pending payment
        $pendingPayment = Payment::where('rental_request_id', $rentalRequest->id)
            ->where('status', 'pending')
            ->first();

        if ($pendingPayment) {
            return response()->json([
                'message' => 'A payment is already pending for this request',
                'payment' => $pendingPayment,
                'already_pending' => true,
            ], 200);
        }

        $payment = Payment::create([
            'rental_request_id' => $rentalRequest->id,
            'user_id' => $user->id,
            'post_id' => $rentalRequest->post_id,
            'amount' => $rentalRequest->post->Price,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
        ]);

        // In a real application, you would integrate with payment gateway here
        // For now, we'll simulate payment processing
        // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)

        return response()->json([
            'message' => 'Payment initiated',
            'payment' => $payment,
        ], 201);
    }

    /**
     * Confirm payment (called by payment gateway webhook or manually)
     */
    public function confirm(Request $request, $id)
    {
        $payment = Payment::with(['rentalRequest', 'post'])->findOrFail($id);

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Payment already confirmed'], 400);
        }

        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
            'transaction_id' => $request->transaction_id ?? 'TXN-' . time(),
            'payment_details' => $request->payment_details ?? [],
        ]);

        // Create contract with status pending (waiting for owner to confirm payment receipt)
        $contract = Contract::create([
            'rental_request_id' => $payment->rental_request_id,
            'payment_id' => $payment->id,
            'user_id' => $payment->user_id,
            'post_id' => $payment->post_id,
            'start_date' => now()->addDays(7), // Default: 7 days from now
            'end_date' => now()->addMonths(12), // Default: 1 year
            'monthly_rent' => $payment->amount,
            'status' => 'pending', // Waiting for owner to confirm payment receipt
            'terms' => $this->generateContractTerms($payment->post),
        ]);

        // Update rental request status to payment_received (تم الاستلام)
        if ($payment->rentalRequest) {
            $payment->rentalRequest->update(['status' => 'payment_received']);
        }

        // Notify apartment owner to confirm payment receipt
        Notification::create([
            'user_id' => $payment->post->user_id,
            'type' => 'payment_received',
            'title' => 'Payment Received - Confirm Receipt',
            'message' => "Payment of {$payment->amount} has been received for {$payment->post->Title}. Please confirm receipt of payment to proceed with contract signing.",
            'data' => [
                'payment_id' => $payment->id,
                'contract_id' => $contract->id,
                'post_id' => $payment->post_id,
            ],
        ]);

        // Notify renter
        Notification::create([
            'user_id' => $payment->user_id,
            'type' => 'payment_confirmed',
            'title' => 'Payment Confirmed',
            'message' => "Your payment has been confirmed. Please review and sign the contract.",
            'data' => [
                'payment_id' => $payment->id,
                'contract_id' => $contract->id,
                'post_id' => $payment->post_id,
            ],
        ]);

        return response()->json([
            'message' => 'Payment confirmed and contract created',
            'payment' => $payment,
            'contract' => $contract,
        ]);
    }

    /**
     * Generate contract terms template
     */
    private function generateContractTerms($post)
    {
        return "This is a rental contract for the apartment located at {$post->Address}. 
        The monthly rent is {$post->Price}. 
        Utilities policy: {$post->Utilities_Policy}. 
        Pet policy: " . ($post->Pet_Policy ? 'Allowed' : 'Not allowed') . ".
        Please review all terms before signing.";
    }
}
