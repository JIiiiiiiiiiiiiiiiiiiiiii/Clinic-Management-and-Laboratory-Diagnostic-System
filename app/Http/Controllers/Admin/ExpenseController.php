<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        // For now, return empty data structure to avoid errors
        $expenses = (object) [
            'data' => [],
            'links' => [],
            'meta' => []
        ];

        // Get summary statistics
        $summary = [
            'total_expenses' => 0,
            'pending_amount' => 0,
            'total_count' => 0,
            'approved_count' => 0,
        ];

        return Inertia::render('admin/billing/expenses', [
            'expenses' => $expenses,
            'summary' => $summary,
            'filters' => $request->only(['search', 'category', 'status', 'payment_method', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/billing/expense-create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'expense_category' => 'required|in:office_supplies,medical_supplies,equipment,utilities,rent,maintenance,marketing,other',
            'expense_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,bank_transfer,check',
            'payment_reference' => 'nullable|string|max:255',
            'vendor_name' => 'nullable|string|max:255',
            'vendor_contact' => 'nullable|string|max:255',
            'receipt_number' => 'nullable|string|max:255',
            'status' => 'required|in:draft,pending,approved,cancelled',
            'notes' => 'nullable|string',
        ]);

        try {
            Expense::create([
                'expense_category' => $request->expense_category,
                'expense_name' => $request->expense_name,
                'description' => $request->description,
                'amount' => $request->amount,
                'expense_date' => $request->expense_date,
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'vendor_name' => $request->vendor_name,
                'vendor_contact' => $request->vendor_contact,
                'receipt_number' => $request->receipt_number,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            return redirect()->route('admin.billing.expenses')
                ->with('success', 'Expense created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create expense. Please try again.']);
        }
    }

    public function show(Expense $expense)
    {
        $expense->load(['createdBy', 'updatedBy']);

        return Inertia::render('admin/billing/expense-show', [
            'expense' => $expense,
        ]);
    }

    public function edit(Expense $expense)
    {
        if (!$expense->canBeEdited()) {
            return redirect()->route('admin.billing.expenses')
                ->with('error', 'This expense cannot be edited.');
        }

        $expense->load(['createdBy']);

        return Inertia::render('admin/billing/expense-edit', [
            'expense' => $expense,
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        if (!$expense->canBeEdited()) {
            return redirect()->route('admin.billing.expenses')
                ->with('error', 'This expense cannot be edited.');
        }

        $request->validate([
            'expense_category' => 'required|in:office_supplies,medical_supplies,equipment,utilities,rent,maintenance,marketing,other',
            'expense_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,bank_transfer,check',
            'payment_reference' => 'nullable|string|max:255',
            'vendor_name' => 'nullable|string|max:255',
            'vendor_contact' => 'nullable|string|max:255',
            'receipt_number' => 'nullable|string|max:255',
            'status' => 'required|in:draft,pending,approved,cancelled',
            'notes' => 'nullable|string',
        ]);

        try {
            $expense->update([
                'expense_category' => $request->expense_category,
                'expense_name' => $request->expense_name,
                'description' => $request->description,
                'amount' => $request->amount,
                'expense_date' => $request->expense_date,
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'vendor_name' => $request->vendor_name,
                'vendor_contact' => $request->vendor_contact,
                'receipt_number' => $request->receipt_number,
                'status' => $request->status,
                'notes' => $request->notes,
                'updated_by' => auth()->id(),
            ]);

            return redirect()->route('admin.billing.expenses')
                ->with('success', 'Expense updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update expense. Please try again.']);
        }
    }

    public function destroy(Expense $expense)
    {
        if (!$expense->canBeCancelled()) {
            return redirect()->route('admin.billing.expenses')
                ->with('error', 'This expense cannot be deleted.');
        }

        $expense->delete();

        return redirect()->route('admin.billing.expenses')
            ->with('success', 'Expense deleted successfully.');
    }

    public function updateStatus(Request $request, Expense $expense)
    {
        $request->validate([
            'status' => 'required|in:draft,pending,approved,cancelled',
        ]);

        $expense->update([
            'status' => $request->status,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Expense status updated successfully.');
    }
}